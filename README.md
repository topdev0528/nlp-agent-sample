# agent-kleene

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

## Contributing

We are open to contributions.

* The software is provided under the [MIT license](LICENSE). Contributions to
this project are accepted under the same license.
* Please also ensure that each commit in the series has at least one
`Signed-off-by:` line, using your real name and email address. The names in
the `Signed-off-by:` and `Author:` lines must match. If anyone else
contributes to the commit, they must also add their own `Signed-off-by:`
line. By adding this line the contributor certifies the contribution is made
under the terms of the
[Developer Certificate of Origin (DCO)](DeveloperCertificateOfOrigin.txt).
* Questions, bug reports, et cetera are raised and discussed on the issues page.
* Please make merge requests into the master branch.
