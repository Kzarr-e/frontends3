module.exports = {
  apps: [
    {
      name: "kzarre-frontend-blue",
      script: "npm",
      args: "start -- -p 3000",
      watch: false
    },
    {
      name: "kzarre-frontend-green",
      script: "npm",
      args: "start -- -p 3001",
      watch: false
    }
  ]
}
