import React from 'react';
import { useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import microPhoneIcon from "../microphone.svg";
import openaiIcon from "../openai.svg";

const synth = window.speechSynthesis;

const TalkGPT = () => {

    const { transcript, resetTranscript, listening } = useSpeechRecognition();
    const [ loading, setLoading ] = useState(false);
    const [ conversationId, setConversationId ] = useState('');
    const [ messageId, setMessageId ] = useState('');
    const [ speaking, setSpeaking ] = useState(false);
    const microphoneRef = useRef(null);
    const openaiRef = useRef(null);

    const handleListing = () => {
      microphoneRef.current.classList.add("listening");
      SpeechRecognition.startListening({
        continuous: true,
      });
    };
    const stopHandle = () => {
      microphoneRef.current.classList.remove("listening");
      SpeechRecognition.stopListening();
      sendMessage();
      resetTranscript();
    };
    const sendMessage = async () => {
      if (transcript !== ''){
        try {
          setLoading(true);
          const res = await fetch("http://localhost:3080", {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({
              message: transcript,
              conversationId: conversationId, 
              parentMessageId: messageId
            })
          });
          const data = await res.json();
          // console.log(data);
          setConversationId(data['conversationId']);
          setMessageId(data['messageId']);
          setLoading(false);
          const utterThis = new SpeechSynthesisUtterance(data['response']);
            utterThis.voice = synth.getVoices()[1];
            synth.speak(utterThis);
            utterThis.addEventListener('start',() => {
              if(synth.speaking){
                setSpeaking(true);
              }
            });
            utterThis.addEventListener('end',() => {
              if(!synth.speaking){
                setSpeaking(false);
              }
            });
        } catch (error) {
          alert(error.toString());
          setLoading(false);
        }
      }
    }

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      return (
        <div className="mircophone-container">
          Browser is not Support Speech Recognition.
        </div>
      );
    }

    return (
        <div className="microphone-wrapper">
          <div className="mircophone-container">
            <div
              className="microphone-icon-container"
              ref={microphoneRef}
              onClick={handleListing}
            >
              <img alt="microphone icon" src={microPhoneIcon} className="microphone-icon" />
            </div>
            <div className="microphone-status">
              {listening ? "Recording........." : "Click and talk to chat GPT"}
            </div>
            {listening && (
              <button className="microphone-stop btn" onClick={stopHandle}>
                Stop
              </button>
            )}
          </div>
          {loading && (
            <div className="loader">
              <div className="inner one"></div>
              <div className="inner two"></div>
              <div className="inner three"></div>
            </div>
          )}
          {speaking && (
            <div className="speaking-container">
            <div className="openai-icon-container" ref={openaiRef}>
              <img alt='openai icon' src={openaiIcon}/>
            </div>
            </div>
          )}
        </div>
    );
}

export default TalkGPT;
