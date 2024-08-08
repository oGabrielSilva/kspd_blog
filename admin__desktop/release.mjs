import { execSync } from 'child_process'
import fs from 'fs'
import { stdin, stdout } from 'process'
import readline from 'readline'

const { version } = JSON.parse(fs.readFileSync('./package.json'))

// Função para atualizar a versão no package.json
function updateVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  const tauriJson = JSON.parse(fs.readFileSync('./rust/tauri.conf.json', 'utf-8'))
  packageJson.version = newVersion
  tauriJson.package.version = newVersion.replace(/[^0-9.]/g, '')
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n')
  fs.writeFileSync('./rust/tauri.conf.json', JSON.stringify(tauriJson, null, 2) + '\n')
}

// Função para gerar builds usando Tauri
function buildTauri() {
  console.log('Gerando build para MSI, DEB, AppImage, RPM e updater...')
  execSync('bunx tauri build', { stdio: 'inherit' })
}

// Função para criar um commit no Git
function createGitCommit(newVersion) {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m "Release v${newVersion}"`, { stdio: 'inherit' })
}

// Função principal
async function main() {
  console.log(`Versão atual: ${version}`)

  const rl = readline.createInterface({
    input: stdin,
    output: stdout,
  })

  rl.question('Insira a nova versão: ', (newVersion) => {
    updateVersion(newVersion)
    console.log(`Versão atualizada para: ${newVersion}`)

    buildTauri()

    createGitCommit(newVersion)
    console.log(`Commit criado para a versão: v${newVersion}`)

    rl.close()
  })
}

main()
