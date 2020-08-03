/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

import { Subject } from 'rxjs'

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var commands = [
  'join',
  'sit',
  'tourney',
  'ready',
  'tables',
  'players',
  'scorebook'
]
var value = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'jack',
  'queen',
  'king',
  'ace'
]
var suit5 = ['club', 'diamond', 'heart', 'spade', 'no-trump']
var suit4 = ['clubs', 'diamonds', 'hearts', 'spades']
// var bids = '[bid] ( pass | double | re-double | <values> <suit> )'
// var plays = '<values> of <suits>'

var grammar =
  '#JSGF V1.0; grammar net.jbridge; public <Command> = ' +
  commands.join(' | ') +
  ' ; '
grammar += 'public <Value> = ' + value.join(' | ') + ' ;'
grammar += 'public <Suit5> = ' + suit5.join(' | ') + ' ;'
grammar += 'public <Suit4> = ' + suit4.join(' | ') + ' ;'
grammar += 'public <Bid> = ( pass | double | re-double | <Value> <Suit5> ) ; '
grammar += 'public <Play> = <Value> of <Suit4> ;'

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

    this.recognition.onresult = event => {
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

    this.recognition.onerror = event => {
      console.log(`Error occurred in recognition: ${event.error}`)
      this.resultSubject.error(`Error occurred in recognition: ${event.error}`)
    }
  }

  speak () {
    this.recognition.start()
    return this.resultSubject
  }
}
