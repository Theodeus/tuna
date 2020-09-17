# example

## Project setup

```
yarn install
yarn serve
```

## Deployment

- If you use a sub directory(ex: http://example.com/tuna/), you have to edit `vue.config` .

```vue.config
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/SandBox/tuna/' : "/"
}
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
