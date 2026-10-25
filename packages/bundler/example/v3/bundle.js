const bundle = require('@asyncapi/bundler')
const {readFileSync, writeFileSync} = require('fs')

async function main() {
    await singleFile()
    await multiFile()
    await singleFileWithBaseDir()
}


async function singleFileWithBaseDir(){
    const document = await bundle([readFileSync('./spec/main.yaml', 'utf-8')], {baseDir: './spec'})
    writeFileSync('asyncapi.yaml', document.yml())
}

async function singleFile(){
    const document = await bundle([readFileSync('./spec/main.yaml', 'utf-8')])
    writeFileSync('asyncapi.yaml', document.yml())
}

async function multiFile(){
    const document = await bundle(['./camera.yml', './audio.yml'].map( f => readFileSync(f, 'utf-8')))
    writeFileSync('spec.yaml', document.yml())
}


main().catch(e => console.error(e))