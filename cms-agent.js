#!/usr/bin/env node
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { Client } = require('@hubspot/api-client');

function getHubSpotClient() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return null;
  }
  return new Client({ accessToken: token });
}

function createModule(name) {
  const moduleDir = path.join(process.cwd(), 'modules', name);
  fs.mkdirSync(moduleDir, { recursive: true });

  fs.writeFileSync(
    path.join(moduleDir, `${name}.html`),
    [
      `<div class="${name}">`,
      `  <!-- ${name} markup -->`,
      `</div>`
    ].join('\n') + '\n'
  );

  fs.writeFileSync(
    path.join(moduleDir, `${name}.js`),
    [
      `export default function () {`,
      `  console.log('${name} module loaded');`,
      `}`
    ].join('\n') + '\n'
  );

  fs.writeFileSync(
    path.join(moduleDir, `${name}.css`),
    [
      `.${name} {`,
      `  /* styles */`,
      `}`
    ].join('\n') + '\n'
  );

  const meta = {
    label: name,
    fields: []
  };
  fs.writeFileSync(path.join(moduleDir, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`Module ${name} created at ${moduleDir}`);

  const client = getHubSpotClient();
  if (client) {
    uploadModule(client, name, moduleDir, meta);
  }
}

async function uploadModule(client, name, moduleDir, meta) {
  try {
    const html = fs.readFileSync(path.join(moduleDir, `${name}.html`), 'utf8');
    const css = fs.readFileSync(path.join(moduleDir, `${name}.css`), 'utf8');
    const js = fs.readFileSync(path.join(moduleDir, `${name}.js`), 'utf8');
    await client.apiRequest({
      method: 'POST',
      path: '/cms/v3/modules',
      body: {
        label: meta.label,
        html,
        css,
        js,
        fields: meta.fields
      }
    });
    console.log(`Uploaded module ${name} to HubSpot`);
  } catch (err) {
    console.error(`Failed to upload module: ${err.message}`);
  }
}

function createTemplate(name) {
  const templateDir = path.join(process.cwd(), 'templates', name);
  fs.mkdirSync(templateDir, { recursive: true });
  fs.writeFileSync(
    path.join(templateDir, `${name}.html`),
    [
      '{% raw %}{% extends "@hubspot/blank" %}',
      '{% block body %}',
      `<div class="${name}">`,
      '  <!-- ${name} content -->',
      '</div>',
      '{% endblock %}{% endraw %}'
    ].join('\n') + '\n'
  );
  fs.writeFileSync(path.join(templateDir, 'meta.json'), JSON.stringify({ label: name }, null, 2));
  console.log(`Template ${name} created at ${templateDir}`);

  const client = getHubSpotClient();
  if (client) {
    uploadTemplate(client, name, templateDir);
  }
}

async function uploadTemplate(client, name, templateDir) {
  try {
    const source = fs.readFileSync(path.join(templateDir, `${name}.html`), 'utf8');
    await client.apiRequest({
      method: 'POST',
      path: '/cms/v3/templates',
      body: {
        label: name,
        source
      }
    });
    console.log(`Uploaded template ${name} to HubSpot`);
  } catch (err) {
    console.error(`Failed to upload template: ${err.message}`);
  }
}

program
  .name('cms-agent')
  .description('Scaffold and optionally upload HubSpot CMS modules and templates')
  .version('1.0.0');

program.command('module')
  .description('Create a module scaffold')
  .argument('<name>', 'Module name')
  .action(createModule);

program.command('template')
  .description('Create a template scaffold')
  .argument('<name>', 'Template name')
  .action(createTemplate);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
