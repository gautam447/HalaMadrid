# HalaMadrid
Its all about foootball

## HubSpot CMS Agent

This repo includes `cms-agent.js`, a simple CLI to scaffold HubSpot CMS modules and templates and optionally upload them using a HubSpot access token.

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Export an access token so the agent can upload resources:
   ```bash
   export HUBSPOT_ACCESS_TOKEN=your_token_here
   ```

### Usage
Create a module scaffold:
```bash
node cms-agent.js module my-module
```

Create a template scaffold:
```bash
node cms-agent.js template my-template
```
