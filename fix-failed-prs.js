#!/usr/bin/env node
// Wrapper script to run fix-failed-prs from workspace root
const path = require('path');
require(path.join(__dirname, 'ai-brain', 'fix-failed-prs.js'));
