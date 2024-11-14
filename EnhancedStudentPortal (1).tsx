'use client'

import React, { useState } from 'react'
import { AlertCircle, LogOut, Upload, User, Users } from 'lucide-react'

// Utility function to generate class names conditionally
const cn = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' ')

// Mock database
let studentDatabase: {
  [key: string]: {
    name: string;
    password: string;
    grades: { subject: string; grade: string }[];
  };
} = {
  'student123': {
    name: 'John Doe',
    password: 'password123',
    grades: [
      { subject: 'Mathematics', grade: 'A' },
      { subject: 'Science', grade: 'B+' },
      { subject: 'History', grade: 'A-' },
      { subject: 'English', grade: 'B' },
    ]
  }
}

// Mock API calls
const fetchResults = async (studentId: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (studentId in studentDatabase && studentDatabase[studentId].password === password) {
    return { name: studentDatabase[studentId].name, grades: studentDatabase[studentId].grades }
  }
  throw new Error('Invalid credentials')
}

const adminLogin = async (username: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (username === 'admin' && password === 'admin123') {
    return true
  }
  throw new Error('Invalid admin credentials')
}

const uploadResults = async (results: { studentId: string, name: string, password: string, grades: { subject: string, grade: string }[] }) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  studentDatabase[results.studentId] = { 
    name: results.name, 
    password: results.password,
    grades: results.grades 
  }
  return true
}

type User = 'student' | 'admin'

export default function EnhancedStudentPortal() {
  const [userType, setUserType] = useState<User>('student')
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [results, setResults] = useState<null | { name: string, grades: { subject: string, grade: string }[] }>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentPassword, setNewStudentPassword] = useState('')
  const [newGrades, setNewGrades] = useState([{ subject: '', grade: '' }])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      if (userType === 'student') {
        const data = await fetchResults(studentId, password)
        setResults(data)
      } else {
        await adminLogin(studentId, password)
        setIsAdminLoggedIn(true)
      }
    } catch (err) {
      setError(`Invalid ${userType} ID or password`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setResults(null)
    setStudentId('')
    setPassword('')
    setIsAdminLoggedIn(false)
    setNewStudentId('')
    setNewStudentName('')
    setNewStudentPassword('')
    setNewGrades([{ subject: '', grade: '' }])
  }

  const handleAddGrade = () => {
    setNewGrades([...newGrades, { subject: '', grade: '' }])
  }

  const handleGradeChange = (index: number, field: 'subject' | 'grade', value: string) => {
    const updatedGrades = newGrades.map((grade, i) => 
      i === index ? { ...grade, [field]: value } : grade
    )
    setNewGrades(updatedGrades)
  }

  const handleUploadResults = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await uploadResults({
        studentId: newStudentId,
        name: newStudentName,
        password: newStudentPassword,
        grades: newGrades.filter(grade => grade.subject && grade.grade)
      })
      setNewStudentId('')
      setNewStudentName('')
      setNewStudentPassword('')
      setNewGrades([{ subject: '', grade: '' }])
      setError('Results uploaded successfully!')
    } catch (err) {
      setError('Failed to upload results')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">ED-JOHN STUDENT PORTAL</h2>
          <p className="text-sm">{userType === 'student' ? 'Check your results here' : 'Admin Panel'}</p>
        </div>
        <div className="p-6">
          {!results && !isAdminLoggedIn ? (
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setUserType('student')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      userType === 'student' ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    <User className="inline-block mr-2" size={16} />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('admin')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      userType === 'admin' ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    <Users className="inline-block mr-2" size={16} />
                    Admin
                  </button>
                </div>
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                    {userType === 'student' ? 'Student ID' : 'Admin Username'}
                  </label>
                  <input
                    id="id"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={`Enter your ${userType === 'student' ? 'student ID' : 'admin username'}`}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-4 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <div>
              {userType === 'student' && results ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">Welcome, {results.name}</h3>
                  <h4 className="text-md font-medium mb-2">Your Results:</h4>
                  <ul className="space-y-2">
                    {results.grades.map((grade, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{grade.subject}</span>
                        <span className="font-semibold">{grade.grade}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <form onSubmit={handleUploadResults}>
                  <h3 className="text-lg font-semibold mb-4">Upload Student Results</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="newStudentId" className="block text-sm font-medium text-gray-700">
                        Student ID
                      </label>
                      <input
                        id="newStudentId"
                        type="text"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="newStudentName" className="block text-sm font-medium text-gray-700">
                        Student Name
                      </label>
                      <input
                        id="newStudentName"
                        type="text"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="newStudentPassword" className="block text-sm font-medium text-gray-700">
                        Student Password
                      </label>
                      <input
                        id="newStudentPassword"
                        type="password"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={newStudentPassword}
                        onChange={(e) => setNewStudentPassword(e.target.value)}
                      />
                    </div>
                    {newGrades.map((grade, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Subject"
                          required
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={grade.subject}
                          onChange={(e) => handleGradeChange(index, 'subject', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Grade"
                          required
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          value={grade.grade}
                          onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddGrade}
                      className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Grade
                    </button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 mt-4 text-green-500 text-sm">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "mt-6 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? 'Uploading...' : 'Upload Results'}
                  </button>
                </form>
              )}
              <button
                onClick={handleLogout}
                className="mt-6 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}