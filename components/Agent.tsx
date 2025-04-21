"use client";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, type , interviewId , questions }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setisSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage  = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setisSpeaking(true);
    const onSpeechEnd = () => setisSpeaking(false);

    const onError = (error: Error) => {
      console.error("error aa gya = ", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleFeedback= async (messages:SavedMessage[]) => {
    ////console.log("messages- genrate feed back here", messages);

    const {success , feedbackId:id} = await createFeedback({
      interviewId:interviewId!,
      userId:userId!,
      transcript:messages,
    })
    

    if(success && id){
      router.push(`/interview/${interviewId}/feedback`)
    }else{
      ////console.log("error in feedback");
      router.push('/')
    }
  }

  useEffect(() => {
    if(callStatus === CallStatus.FINISHED){
      if(type === 'generate'){
        router.push("/");
      }else{
        handleFeedback(messages);
      }
    }
  }, [callStatus, messages, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
  if(type === 'generate'){
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
      variableValues: {
        username: userName,
        userid: userId,
      },
    });
    // ////console.log("Starting call with ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
  } else{
    let formattedQuestions = '';

    if(questions){
      formattedQuestions=questions
      .map((question)=>`- ${question}`)
      .join('\n');
    }
    await vapi.start(interviewer,{
      variableValues:{
        questions:formattedQuestions,
      }
    })
  }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  // ////console.log("latestMessage : ", latestMessage);

  const isCallInactiveorFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer ">
          <div className="avatar">
            <Image
              src={"/ai-avatar.png"}
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image
              src={"/imglaga.webp"}
              alt="avatar_png"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {latestMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity dur500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full justify-center flex">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full  opacity-75",
                (callStatus !== "CONNECTING") && "hidden"
              )}
            />
            <span>
              {isCallInactiveorFinished
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect cursor-pointer" onClick={handleDisconnect}>End</button>
        )}
      </div>
    </>
  );
};

export default Agent;
