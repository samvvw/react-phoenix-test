import * as React from 'react'
import * as ReactDom from 'react-dom/client'
import Greeter from './Greeter'

// const Greet = ({ name }) => <h1>Hello, world! {name}</h1>
// console.log(Server.renderToString(<Greet name={'Coco'} />))

const root = document.getElementById('react-root')
const rootComponent = ReactDom.createRoot(root)
rootComponent.render(<Greeter name="Coco" />)
