const fs = require('fs')
const path = require('path')
const glob = require('glob')
const strip = require('strip-comments')

const exts = {
  js: 'js',
  jsx: 'js',
  ts: 'js',
  tsx: 'js',
  css: 'css',
  scss: 'css',
  html: 'html',
  md: 'html',
  json: 'json',
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).replace('.', '')
  return exts[ext] || 'js'
}

function shouldProcess(file) {
  if (file.includes('node_modules') || file.includes('.next') || file.includes('.git')) return false
  
  const ext = path.extname(file).replace('.', '')
  return Object.keys(exts).includes(ext)
}

const files = glob.sync('**