/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

import { Subject } from 'rxjs'

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var bids = ['pass', 'double', 're-double', '1', '2', '3', '4', '5', '6', '7', 'club', 'diamond', 'heart', 'spade', 'no-trump']
var plays = ['2 of', '3 of', '4 of', '5 of', '6 of', '7 of', '8 of', '9 of', '10 of', 'jack of', 'queen of', 'king of', 'ace of', 'clubs', 'diamonds', 'hearts', 'spades']

var grammar = '#JSGF V1.0; grammar bids; public <bid> = ' + bids.join(' | ') + ' ;'
grammar += 'public <play> = ' + plays.join(' | ') + ' ;'

export default class SpeechToText {
  constructor () {
    this.recognition = new SpeechRecognition()
    this.speechRecognitionList = new SpeechGrammarList()
    this.speechRecognitionList.addFromString(grammar, 1)
    this.recognition.grammars = this.speechRecognitionList
    this.recognition.continuous = false
    this.recognition.lang = 'en-EN'
    this.recognition.interimResults = false
    this.recognition.maxAlternatives = 1

    this.result = 'created'
    this.resultSubject = new Subject()

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
