"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  addMessage_aRS,
  AskRSMessage,
  getAllMessages_aRS,
  Message,
} from "@/app/_lib/db";
import { askRS_sendMessage as apiSendMessage } from "@/dal/message";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { store } from "@/app/_utils/store";

import { ChatMessageInput } from "@/app/ask-anything/[chatId]/_components/ChatMessageInput";
import { MessageContainer } from "@/app/ask-anything/[chatId]/_components/MessageContainer";
import {
  Cardset,
  WelcomeCards,
} from "@/app/ask-anything/[chatId]/_components/WelcomeCards";
import Loading from "@/app/loading";
import { createId } from "@paralleldrive/cuid2";

const cards: Cardset = {
  top: "Can you tell me about some of your projects?",
  bottomLeft: "What is RipeSeed known for?",
  bottomRight: "Do you guys work on AI?",
};

export function ChatMessages() {
  const [uId, setUId] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AskRSMessage[]>([]);
  const { set, useSnapshot } = store;
  const { clearChat } = useSnapshot();

  const { mutateAsync: sendMessageMutation, isPending } = useMutation({
    mutationFn: apiSendMessage,
    onSuccess: (res) => {
      setMessages((prev) => [...prev, res]);
      addMessage_aRS({ content: res.content, role: res.role });
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { data: messagesRes, isPending: isLoading } = useQuery({
    queryKey: ["messages", "askRS"],
    queryFn: async () => {
      if (!uId) return [];

      return await getAllMessages_aRS();
    },
    enabled: !!uId,
  });

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (clearChat) {
      setMessages([]);
      set("clearChat", false);
    }
  }, [clearChat]);

  useEffect(() => {
    if (messagesRes?.length) {
      setMessages(messagesRes);
    }
  }, [messagesRes]);

  useEffect(() => {
    setUId(getUId());
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  function getUId() {
    // get uId from local storage, if it does not exist create one
    let uId = localStorage.getItem("uId");
    if (!uId) {
      const _uId = createId();
      uId = _uId;
      localStorage.setItem("uId", _uId);
    }
    return uId;
  }

  const sendMessage = async (newMessage: string) => {
    if (!newMessage.trim() || isPending) {
      return false;
    }

    const tmpMessage: Message = {
      content: newMessage,
      role: "user",
      chatId: 1,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
    };

    setMessages((prev) => [...prev, tmpMessage]);
    addMessage_aRS({ content: tmpMessage.content, role: tmpMessage.role });
    scrollToBottom();

    await sendMessageMutation({
      message: tmpMessage,
      uId,
    });
    return true;
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-[calc(100svh-57px)] w-full flex-col overflow-y-auto overflow-x-hidden md:h-[calc(100svh-93px)]">
      <div
        ref={messagesContainerRef}
        className={`flex w-full flex-auto flex-col ${!messages.length ? "justify-center" : "none"} grow overflow-y-auto overflow-x-hidden md:h-[85%]`}
      >
        <AnimatePresence>
          {!messages.length ? (
            <WelcomeCards
              sendMessage={sendMessage}
              cards={cards}
              hideSetupKey={true}
            />
          ) : (
            <>
              {messages.map((message, i) => (
                <MessageContainer message={message as Message} key={i} />
              ))}
              {isPending && (
                <MessageContainer
                  isPending={true}
                  message={{
                    content: "",
                    role: "assistant",
                    chatId: 1,
                    createdAt: new Date().toString(),
                    updatedAt: new Date().toString(),
                  }}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>
      <div className="  w-full px-4 pb-4 lg:px-20">
        <ChatMessageInput
          sendMessage={sendMessage}
          isReplyPending={isPending}
        />
      </div>
    </div>
  );
}