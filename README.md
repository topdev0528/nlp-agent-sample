# anac-agent-kleene

A dumb negotation agent based on regex.

## Setup

```bash
npm install
```

## Usage

```bash
npm start
```

To make a bid, input:

- "@AgentName I want @number @good"
- "@AgentName I want @number @good for $@number"
- "@AgentName I want @number @good and @number @good"
- "@AgentName I want @number @good, @number @good @number USD"

The agent will then offer a counter-offer, and then to accept the bid,
use one of the following pharses:

- "@AgentName I accept"
- "@AgentName I agree"
