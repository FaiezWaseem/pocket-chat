'use client'

import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, MoreVertical, Phone, Video, Paperclip, Image as ImageIcon, Trash2, Download, ArrowLeft } from 'lucide-react'
import SideBar from './Sidebar'
import { User } from '@/types/User'
import useUser from '@/hooks/user'
import pb from '@/lib/pb'
import { POCKET_ENDPOINT } from '@/contants'



type Message = {
    id ?: string
    collectionId?: string
    senderId: string
    recieverId: string
    text: string
    time: string
    file?: string | any ,
    filetype : 'image' | 'video'
}

const getUrl  = (message : Message) => `${POCKET_ENDPOINT}/api/files/${message.collectionId}/${message!.id}/${message.file}`


export default function WhatsAppClone() {
    const [selectedContact, setSelectedContact] = useState<User | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const user = useUser(state=> state.user)
    const [sidebarWidth, setSidebarWidth] = useState(300)
    const [isDragging, setIsDragging] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }


    useEffect(()=>{
        if(!selectedContact) return

        loadInitialMessages()

        pb.collection('chats').subscribe('*', function (e) {
            console.log(e.action);
            console.log(e.record);
            const newMessage : Message = e.record as unknown as Message

            if(e.action === 'create'){
                setMessages(prevMessages => [...prevMessages, newMessage])
            }

        },{})

        return ()=> {
             pb.collection('chats').unsubscribe()
        }; 


    },[selectedContact])


    const loadInitialMessages = async () =>
    {

        const records = await pb.collection('chats').getFullList<Message>({
            filter: `(senderId="${selectedContact!.id}" && recieverId="${user!.id}") || senderId="${user!.id}" && recieverId="${selectedContact!.id}"`
        })
        setMessages(records)
        console.log(records)

    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' && !file) return
        const newMsg: Message = {
            senderId: user?.id ?? '', // Assuming 0 is the current user
            recieverId: selectedContact?.id ?? '',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            file: undefined,
            filetype: 'image'
        }
        if (file) {
            const fileType = file.type.startsWith('image/') ? 'image' : 'video'
            newMsg.file = file
            newMsg.filetype = fileType
        }

        await pb.collection('chats').create(newMsg)

        // setMessages([...messages, newMsg])
        setNewMessage('')
        setFile(null)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleDeleteMessage = (id: string) => {
        setMessages(messages.filter(message => message!.collectionId !== id))
    }

    const handleDownload = (url: string, filename: string) => {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }


    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMobile) return
        e.preventDefault()
        setIsDragging(true)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || isMobile) return
        const newWidth = e.clientX
        if (newWidth > 200 && newWidth < 600) {
            setSidebarWidth(newWidth)
        }
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <SideBar
                sidebarRef={sidebarRef}
                sidebarWidth={sidebarWidth}
                selectedContact={selectedContact}
                setSelectedContact={setSelectedContact}
                isMobile={isMobile}
            />

            {/* Draggable divider (hidden on mobile) */}
            {!isMobile && (
                <div
                    className="w-1 bg-border cursor-col-resize"
                    onMouseDown={handleMouseDown}
                />
            )}

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${isMobile && !selectedContact ? 'hidden' : 'block'}`}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-background border-b border-border flex justify-between items-center">
                            <div className="flex items-center">
                                {isMobile && (
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)} className="mr-2">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                )}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h2 className="ml-4 text-xl font-semibold">{selectedContact.name}</h2>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            {messages.map(message => (
                                <div
                                    key={message.collectionId}
                                    className={`mb-4 flex ${message.senderId === user!.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`p-3 rounded-lg max-w-[70%] ${message.senderId === user!.id? 'bg-primary text-primary-foreground' : 'bg-muted'
                                            }`}
                                    >
                                        {message.file && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="mb-2 cursor-pointer">
                                                        {message.filetype === 'image' ? (
                                                            <img src={getUrl(message)} alt="Attached image" className="max-w-full max-h-[200px] object-contain rounded" />
                                                        ) : (
                                                            <video src={getUrl(message)} className="max-w-full rounded" />
                                                        )}
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[800px]">
                                                    {message.filetype === 'image' ? (
                                                        <img src={getUrl(message)} alt="Full size image" className="max-w-full max-h-[80vh] object-contain" />
                                                    ) : (
                                                        <video src={getUrl(message)} controls className="max-w-full max-h-[80vh]" />
                                                    )}
                                                    <Button onClick={() => handleDownload(message?.file ?? '', `file-${message.collectionId}`)}>
                                                        <Download className="mr-2 h-4 w-4" /> Download
                                                    </Button>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        <p>{message.text}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs opacity-70">{message.time}</p>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDeleteMessage(message!.collectionId ?? '')}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                    {message.file && (
                                                        <DropdownMenuItem onClick={() => handleDownload(message?.file ?? '', `file-${message.collectionId}`)}>
                                                            <Download className="mr-2 h-4 w-4" /> Download
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 bg-background border-t border-border">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSendMessage()
                                }}
                                className="flex gap-2 items-center"
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-5 w-5" />
                                    <span className="sr-only">Attach file</span>
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                {file && (
                                    <div className="flex items-center gap-2 bg-muted p-2 rounded">
                                        {file.type.startsWith('image/') ? (
                                            <ImageIcon className="h-5 w-5" />
                                        ) : (
                                            <Video className="h-5 w-5" />
                                        )}
                                        <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                                    </div>
                                )}
                                <Input
                                    placeholder="Type a message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit">
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">Send message</span>
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    )
}