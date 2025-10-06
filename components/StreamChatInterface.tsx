"use client";

import { UserProfile } from "@/app/profile/page";
import { createOrGetChannel, getStreamUserToken } from "@/lib/actions/stream";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Channel, StreamChat } from "stream-chat";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
  user_id: string;
}

const StreamChatInterface = ({ otherUser }: { otherUser: UserProfile }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setActiveChannel] = useState<Channel | null>(null);

  const router = useRouter();

  const handleSendMeessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newMessage.trim() && channel) {
      try {
        const response = await channel.sendMessage({ text: newMessage.trim() });

        const message: Message = {
          id: response.message.id,
          text: newMessage.trim(),
          sender: "me",
          timestamp: new Date(),
          user_id: currentUserId!,
        };

        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (!messageExists) {
            return [...prev, message];
          }

          return prev;
        });

        setNewMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setError(null);
        const { token, userId, userName, userImage } =
          await getStreamUserToken();
        setCurrentUserId(userId!);

        const chatClient = StreamChat.getInstance(
          process.env.NEXT_PUBLIC_STREAM_API_KEY!
        );

        await chatClient.connectUser(
          {
            id: userId!,
            name: userName,
            image: userImage,
          },
          token
        );


        

        const { channelType, channelId } = await createOrGetChannel(
          otherUser.id
        );

        //get channel
        const chatChannel = chatClient.channel(channelType!, channelId);
        await chatChannel.watch();

        const channelState = await chatChannel.query({
          messages: { limit: 50 },
        });

        //convert stream messages to client format
        const convertedMessages: Message[] = channelState.messages.map(
          (msg) => ({
            id: msg.id,
            text: msg.text || "",
            sender: msg.user?.id === userId ? "me" : "other",
            timestamp: new Date(msg.created_at || new Date()),
            user_id: msg.user?.id || "",
          })
        );

        setMessages(convertedMessages);
        setClient(chatClient);
        setActiveChannel(chatChannel);
      } catch (error) {
        router.push("/chat");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (otherUser) {
      initializeChat();
    }
  }, [otherUser]);

  if (!client || !channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Setting up chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message, key) => (
          <div
            key={key}
            className={`flex ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === "me"
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === "me"
                    ? "text-pink-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/*Message Input */}

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form className="flex space-x-2" onSubmit={handleSendMeessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);

              if (channel && e.target.value.length > 0) {
                channel.keystroke();
              }
            }}
            onFocus={(e) => {
              if (channel) {
                channel.keystroke();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            disabled={!channel}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !channel}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default StreamChatInterface;
