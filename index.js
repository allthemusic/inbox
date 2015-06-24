'use strict'

var bodyParser = require('body-parser')
var Slack = require('slack-node')
var express = require('express')
var app = express()

var port = process.env.PORT || 3000
var slackEndpoint = process.env.SLACK_ENDPOINT
var slack = new Slack()

slack.setWebhook(slackEndpoint)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.head('/', function (req, res) {
  res.send('')
})

function notifySlack(message) {
  var notification = ''

  notification = notification + '*Incoming Message from: ' + message.from_name + ' <' + message.from_email + '>*\n'
  notification = notification + 'Received as: ' + message.email + '\n'
  notification = notification + 'Subject: ' + message.subject + '\n'
  notification = notification + "\n"
  notification = notification + message.text

  slack.webhook({
    text: notification
  }, function(err, response) {
    console.log('[Slack]', err, response);
  });
}

app.post('/', function (req, res) {
  var events = JSON.parse(req.body.mandrill_events)
  console.log(events.length, 'new events from Mandrill')
  // console.log(events)

  for (var i = 0; i < events.length; i++) {
    var event = events[i]
    if (event.event !== 'inbound') { continue }
    var message = event.msg
    console.log('Incoming Message from: ' + message.from_name + ' <' + message.from_email + '>')
    console.log('Received as:', message.email)
    console.log('Subject:', message.subject)
    console.log("")
    console.log(message.text)
    notifySlack(message)
  }
  res.send('okay')
})

var server = app.listen(port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
})
