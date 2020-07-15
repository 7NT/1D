/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

import { Subject } from 'rxjs'

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
// var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
// var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

// var biddings = ['pass', 'double', 'redouble', '1', '2', '3', '4', '5', '6', '7', 'club', 'diamond', 'heart', 'spade', 'no trump']
// var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

export default class SpeechToText {
  constructor () {
    this.recognition = new SpeechRecognition()
    // var speechRecognitionList = new SpeechGrammarList();
    // speechRecognitionList.addFromString(grammar, 1);
    // recognition.grammars = speechRecognitionList;
    // recognition.continuous = false;
    this.result = 'created'
    this.resultSubject = new Subject()

    this.recognition.lang = 'en-EN'
    this.recognition.interimResults = false
    this.recognition.maxAlternatives = 1

    this.recognition.onresult = (event) => {
      console.log('Event', event)

      const last = event.results.length - 1
      this.result = event.results[last][0].transcript

      console.log(`Confidence: ${event.results[0][0].confidence}`, this.result)
      this.resultSubject.next(this.result)
    }

    this.recognition.onspeechend = () => {
      this.recognition.stop()
      console.log('Speech end')
      this.resultSubject.next('')
    }

    this.recognition.onnomatch = () => {
      console.log("I didn't recognise that bidding.")
    }

    this.recognition.onerror = (event) => {
      console.log(`Error occurred in recognition: ${event.error}`)
      this.resultSubject.error(`Error occurred in recognition: ${event.error}`)
    }
  }

  speak () {
    this.recognition.start()
    return this.resultSubject
  }
}
