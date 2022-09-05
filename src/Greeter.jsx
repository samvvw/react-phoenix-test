import React, { useEffect, useRef, useState } from 'react'
import { Socket, Presence } from '../phoenix_socket'
import './styles.css'

const Greeter = (props) => {
    const [out, setOut] = useState('')
    const [user, setUser] = useState(null)
    const [roomUsers, setRoomUsers] = useState([])
    const [notifications, setNotifications] = useState([])
    // const [presences, setPresences] = useState([])
    const name = props.name
    // const userId = '40
    const [userId, setUserId] = useState(Math.floor(Math.random() * 40))
    // const userId = Math.floor(Math.random() * 40)
    const UserSocket = new Socket('ws://10.0.0.224:4000/notifications', {
        params: {
            token: window.userToken,
            user_id: userId,
        },
    })
    const pingRef = useRef(null)

    const channel = useRef(null)
    // const presence = useRef(null)

    const handleJoinRoom = (e) => {
        e.preventDefault()
        if (!user) {
            setUser(e.target.elements['user-name'].value)
        }
    }

    const handleLeaveRoom = (e) => {
        e.preventDefault()
        setUser(null)
        setRoomUsers([])
        // setPresences([])
        if (channel.current) {
            channel.current.leave()
        }
    }

    useEffect(() => {
        if (user) {
            console.log('useEffect')

            UserSocket.connect()

            channel.current = UserSocket.channel(`notifications:${userId}`, {
                user_name: user,
            })

            // presence.current = new Presence(channel.current)

            // channel.current.on('presence_diff', (diff) => {
            //     const { joins, leaves } = diff

            //     console.log(
            //         '[presence_diff] -> joins',
            //         Object.getOwnPropertyNames(joins)
            //     )

            //     console.log(
            //         '[presence_diff] -> leaves',
            //         Object.getOwnPropertyNames(leaves)
            //     )

            //     Object.getOwnPropertyNames(joins).forEach((k) => {
            //         const toast = document.createElement('div')
            //         toast.innerHTML = `${k} joined`
            //         window.document.body.appendChild(toast)
            //         setTimeout(() => {
            //             window.document.body.removeChild(toast)
            //         }, 3000)
            //     })

            //     Object.getOwnPropertyNames(leaves).forEach((k) => {
            //         console.log('leave', k)
            //         const toast = document.createElement('div')
            //         toast.innerHTML = `${k} has left`
            //         window.document.body.appendChild(toast)
            //         setTimeout(() => {
            //             window.document.body.removeChild(toast)
            //         }, 3000)
            //     })
            // })

            // presence.current.onSync(() => {
            //     setPresences(
            //         presence.current.list((id, { metas: [first, ...rest] }) => {
            //             first.id = id
            //             first.count = rest.length
            //             return first
            //         })
            //     )
            // })

            channel.current
                .join()
                .receive('ok', () => {
                    console.log('Joined successfully')
                })
                .receive('error', (reason) => {
                    console.log('Failed to join', reason)
                })

            channel.current.on('notify', (msg) => {
                console.log('[notify] => ', msg)
                setNotifications((prev) => [...prev, msg])
                const toast = document.createElement('div')
                const img = document.createElement('img')
                img.src = msg.avatar_logo
                img.className = 'toast-element'
                const description = document.createElement('p')
                description.innerHTML = msg.description
                description.className = 'toast-element'
                toast.innerHTML = `${msg.subject}`
                toast.className = 'toast-element'
                const toastOut = document.getElementById('toast-out')
                toastOut.appendChild(img)
                toastOut.appendChild(toast)
                toastOut.appendChild(description)
                setTimeout(() => {
                    img.style.transform = 'translateY(-100%) scale(0)'
                    toast.style.transform = 'translateY(100%) scale(0)'
                    description.style.transform = 'translateX(-100%) scale(0)'
                    toastOut.style.transform = 'scaleY(0)'
                }, 2500)
                setTimeout(() => {
                    toastOut.removeChild(img)
                    toastOut.removeChild(toast)
                    toastOut.removeChild(description)
                    toastOut.style.transform = 'scaleY(100%)'
                }, 3000)
            })
            channel.current.on('load_notifications', (msg) => {
                console.log('pong')
                console.log(msg)
                setOut('pong')
                setNotifications(msg.notifications)
                setTimeout(() => {}, 500)
            })

            return () => {
                UserSocket.disconnect()
                channel.current?.leave()
            }
        }
    }, [user])

    const handlePing = () => {
        console.log('ping')
        channel.current?.push('load_notifications', {})
        setOut('ping')
        console.log('_Ping_ref', pingRef.current)
    }

    const handleNotify = (e) => {
        e.preventDefault()
        console.log(e.target.elements.avatar.value)
        const { avatar, subject, description } = e.target.elements
        fetch(
            'http://localhost:4000/notify?' +
                new URLSearchParams({
                    avatar: avatar.value,
                    subject: subject.value,
                    description: description.value,
                    notification_link: 'htoop',
                    user_id: userId,
                }),
            {
                // mode: 'no-cors',
                headers: {
                    'Content-type': 'application/json',
                },
            }
        )
    }

    const connectToChannel = (e) => {
        e.preventDefault()
        handleLeaveRoom(e)

        const channelNumber = e.target.elements['channel-number'].value
        UserSocket.connect()
        setUserId(channelNumber)
        channel.current = UserSocket.channel(`notifications:${channelNumber}`, {
            user_name: '999999',
        })
    }

    return (
        <section className="phx-hero">
            <div id="toast-out"></div>
            <form onSubmit={handleNotify}>
                <div className="form-field">
                    <label htmlFor="avatar">Avatar</label>
                    <input id="avatar" type="number" min="0" max="2" />
                </div>
                <div className="form-field">
                    <label htmlFor="subject">Subject</label>
                    <input id="subject" type="text" />
                </div>
                <div className="form-field">
                    <label htmlFor="description">Description</label>
                    <input id="description" type="text" />
                </div>
                <button>Submit</button>
            </form>
            <button onClick={handleNotify}>Notify</button>
            {!user ? (
                <form action="submit" onSubmit={handleJoinRoom}>
                    <div className="form-field-wrapper">
                        <label htmlFor="user-name">User name:</label>
                        <input
                            type="text"
                            id="user-name"
                            placeholder="Enter your user name"
                        />
                    </div>
                    <button>
                        <span>Join</span>
                    </button>
                </form>
            ) : (
                <div>
                    <button onClick={handleLeaveRoom}>Leave Room</button>
                </div>
            )}
            <h1>
                Hello {name} - UserId: {userId}
            </h1>
            <button onClick={handlePing}>Ping</button>
            <div>{out ? out : ''}</div>
            <div ref={pingRef}>PINGGGGGJ</div>
            <h2>Online users:</h2>
            <div className="connect-to-channel">
                <form onSubmit={connectToChannel}>
                    <label htmlFor="channel-number">Channel number:</label>
                    <input id="channel-number" type="number" />
                    <button>Connect</button>
                </form>
            </div>
            <ul className="notifications">
                {notifications.map((notification, i) => (
                    <li key={i}>
                        <div className="avatar-wrapper">
                            <img src={notification.avatar_logo} alt="avatar" />
                        </div>
                        <div className="notification-body">
                            <p
                                className="subject"
                                dangerouslySetInnerHTML={{
                                    __html: notification.subject,
                                }}
                            ></p>
                            <p
                                className="description"
                                dangerouslySetInnerHTML={{
                                    __html: notification.description,
                                }}
                            ></p>
                        </div>
                        <div className="time-since-received">30min</div>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default Greeter
