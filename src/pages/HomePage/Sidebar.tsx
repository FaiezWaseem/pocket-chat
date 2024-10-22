import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogOutIcon, Search } from 'lucide-react'

import pb from '@/lib/pb'
import { User } from '@/types/User'
import useUser from '@/hooks/user'
import { Button } from '@/components/ui/button'



export default function SideBar({
    sidebarRef,
    sidebarWidth,
    selectedContact,
    setSelectedContact,
    isMobile,
}: {
    sidebarRef: React.RefObject<HTMLDivElement>,
    sidebarWidth: number,
    selectedContact: User | null,
    setSelectedContact: (contact: User | null) => void,
    isMobile: boolean
}) {

    const [searchQuery, setSearchQuery] = useState('')

    const [contacts, setContacts] = useState<User[]>([])

    const user = useUser(state => state.user)

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    )


    useEffect(() => {
        loadcontacts()
    }, [])

    const loadcontacts = async () => {
        const records = await pb.collection('users').getFullList<User>()
        console.log(records)
        setContacts(records)
    }

    const logOut = async () => {
        await pb.authStore.clear()
    }

    return <div
        ref={sidebarRef}
        style={{ width: isMobile ? '100%' : sidebarWidth }}
        className={`border-r border-border flex flex-col ${isMobile && selectedContact ? 'hidden' : 'block'}`}
    >
        <div className="p-4 bg-background">
            <div className='flex flex-row justify-between'>
                <h2 className="text-2xl font-bold mb-4">Chats</h2>
                <Button variant={"outline"} onClick={logOut} ><LogOutIcon /></Button>
            </div>
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
        </div>
        <ScrollArea className="flex-1">
            {filteredContacts.map(contact => contact.id !== user?.id && (
                <div
                    key={contact.id}
                    className={`flex items-center p-4 cursor-pointer hover:bg-muted ${selectedContact?.id === contact.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedContact(contact)}
                >
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                            <h3 className="font-semibold">{contact.name}</h3>
                            <span className="text-sm text-muted-foreground">20 min ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">hey Whats App</p>
                    </div>
                </div>
            ))}
        </ScrollArea>
    </div>
}