const fs = require('fs')
const path = require('path');

window.document.body.innerHTML = fs.readFileSync(path.join(__dirname, '..','..','..','index.html'))
import {schemaReport } from './schema-conversion'

test('load route schema Report' , () =>{
    
    schemaReport()
})