import React from 'react'
import '../remix-ai.css'
import { DefaultModels, GenerationParams, ChatHistory, HandleStreamResponse } from '@remix/remix-ai-core';
import { ConversationStarter, StreamSend, StreamingAdapterObserver, useAiChatApi } from '@nlux/react';
import { AiChat, useAsStreamAdapter, ChatItem } from '@nlux/react';
import { user, assistantAvatar } from './personas';
import { highlighter } from '@nlux/highlighter'
import './color.css'
import '@nlux/themes/unstyled.css';

export let ChatApi = null

export const Default = (props) => {

  const HandleCopyToClipboard = () => {
    const codeBlocks = document.getElementsByClassName('code-block')
    Array.from(codeBlocks).forEach((block) => {
      const copyButtons = block.getElementsByClassName('nlux-comp-copyButton')
      Array.from(copyButtons).forEach((cp_btn) => {
        cp_btn.removeEventListener('click', () => {})
        cp_btn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(block.textContent)
        })
      })
    })
  }
  const send: StreamSend = async (
    prompt: string,
    observer: StreamingAdapterObserver,
  ) => {
    GenerationParams.stream_result = true
    GenerationParams.return_stream_response = GenerationParams.stream_result

    let response = null
    if (await props.plugin.call('remixAI', 'isChatRequestPending')){
      response = await props.plugin.call('remixAI', 'ProcessChatRequestBuffer', GenerationParams);
    } else {
      response = await props.plugin.call('remixAI', 'solidity_answer', prompt, GenerationParams);
    }

    if (GenerationParams.return_stream_response) HandleStreamResponse(response,
      (text) => {observer.next(text)},
      (result) => {
        observer.next(' ') // Add a space to flush the last message
        ChatHistory.pushHistory(prompt, result)
        observer.complete()
        HandleCopyToClipboard()
      }
    )
    else {
      observer.next(response)
      observer.complete()
      HandleCopyToClipboard()
    }

  };
  ChatApi = useAiChatApi();
  const conversationStarters: ConversationStarter[] = [
    { prompt: 'Explain what is a solidity contract!' },
    { prompt: 'Explain briefly the current file in Editor' }]

  // Define initial messages
  const initialMessages: ChatItem[] = [
    {
      role: 'assistant',
      message: 'Welcome to RemixAI! How can I assist you today?'
    }
  ];
  const adapter = useAsStreamAdapter(send, []);

  return (
    <AiChat
      api={ChatApi}
      adapter={ adapter }
      personaOptions={{
        assistant: {
          name: "RemixAI",
          tagline: "Your Web3 AI Assistant",
          avatar: assistantAvatar
        },
        user
      }}
      //initialConversation={initialMessages}
      conversationOptions={{ layout: 'bubbles', conversationStarters }}
      displayOptions={{ colorScheme: "auto", themeId: "remix_ai_theme" }}
      composerOptions={{ placeholder: "Type your query",
        submitShortcut: 'Enter',
        hideStopButton: false,
      }}
      messageOptions={{ showCodeBlockCopyButton: true,
        editableUserMessages: true,
        streamingAnimationSpeed: 2,
        waitTimeBeforeStreamCompletion: 1000,
        syntaxHighlighter: highlighter
      }}
    />
  );
};