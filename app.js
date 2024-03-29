require('dotenv').config()
// console.log(process.env)

const fetch = require('node-fetch')
const logger = require('morgan')
const path = require('path')
const express = require('express')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const app = express()
const port = process.env.PORT || 3000

const Prismic = require('@prismicio/client')
const PrismicH = require('@prismicio/helpers')
const { application } = require('express')
const UAParser = require('ua-parser-js')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

// Initialize the prismic.io api
const initApi = (req) => {
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req,
    fetch,
  })
}

// Link Resolver, set http address directions
const HandleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }
  if (doc.type === 'collection' || doc === 'collection') {
    //collections_names
    return '/collections'
  }
  if (doc.type === 'about') {
    return `/about`
  }
  // Default to homepage
  return '/'
}

// Middleware to inject prismic context
app.use((req, res, next) => {
  // mobile end
  const ua = UAParser(req.headers['user-agent'])
  res.locals.isDesktop = ua.device.type === undefined
  res.locals.isPhone = ua.device.type === 'mobile'
  res.locals.isTablet = ua.device.type === 'tablet'

  // body class
  res.locals.Link = HandleLinkResolver
  res.locals.PrismicH = PrismicH
  res.locals.Numbers = (index) => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

  //console.log(res.locals.Link);

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async (api) => {
  const [meta, preloader, navigation, home, about, { results: collections }] = await Promise.all([
    api.getSingle('meta'),
    api.getSingle('preloader'),
    api.getSingle('navigation'),
    api.getSingle('home'),
    api.getSingle('about'),
    api.query(Prismic.Predicates.at('document.type', 'collection'), {
      fetchLinks: 'product.image',
    }),
  ])
  // console.log(home.data.collection, Link(home.data.collection));

  // console.log(about.data.body[7].items, about.data.body[7].primary)

  // collections.forEach((collection) => {
  //   console.log(collection);
  //   collection.data.products.forEach((item) => {
  //     console.log(item);
  //   });
  // });

  // all images needed to be preloaded before the pages appear
  const assets = []

  // home page images
  home.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  })
  // about page images
  about.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  })
  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url)
      })
    }
  })
  // collection page images
  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url)
    })
  })

  return {
    assets,
    meta,
    home,
    collections,
    about,
    navigation,
    preloader,
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/home', {
    ...defaults,
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ...defaults,
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/collections', {
    ...defaults,
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title',
  })

  res.render('pages/detail', {
    ...defaults,
    product,
  })

  //console.log(product, product.data.highlights[0]);
})

// Listen to application port.
app.listen(port, () => {
  console.log(`Example app listening on port:${port}`)
})
