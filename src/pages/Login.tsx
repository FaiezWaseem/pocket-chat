'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Sun } from 'lucide-react'

import pb from '@/lib/pb'

export default function Login() {
    const [darkMode, setDarkMode] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const toggleDarkMode = () => {
        setDarkMode(!darkMode)
    }

    const RegisterUser = async (e: React.FormEvent) => {
        e.preventDefault()
        // Handle login logic here
        console.log('Login submitted', { email, password, name })

        const data = {
            "email": email,
            "password": password,
            "passwordConfirm": password,
            "name": name
        };

        const record = await pb.collection('users').create(data);

        alert('User created successfully, Please Login To Continue')

        console.log(record)


    }

    const LoginUser = async (e: React.FormEvent) => {
        try {

        e.preventDefault()
        // Handle login logic here
        console.log('Login submitted', { email, password })
        await pb.collection('users').authWithPassword(email, password)

        console.log(pb.authStore.isAuthRecord)
                    
    } catch (error) {
        if(error instanceof Error)
            alert(error.message)
    }
    }



    const handleGoogleSignIn = async () => {

        await pb.collection('users').authWithOAuth2({ provider: 'google' })

    }

    useEffect(() => {

        pb.authStore.onChange((auth, model) => {
            console.log('authStore.onChange', auth, model)
        })

        console.log(pb.authStore.isAuthRecord)

    }, [])

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDarkMode}
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        </Button>
                    </div>
                    <CardDescription>Enter your email to sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form  className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="jhon doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className='flex flex-row gap-3'>
                            <Button type="submit" className="w-full" onClick={LoginUser}>Login</Button>
                            <Button type="submit" className="w-full" onClick={RegisterUser}>register</Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        SignIn with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}