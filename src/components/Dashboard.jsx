import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.jsx'
import { PlusCircle, TrendingUp, Calendar, DollarSign, FileText, Edit, Trash2, LogOut, User } from 'lucide-react'

const Dashboard = ({ user, onLogout }) => {
  const [investments, setInvestments] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [formData, setFormData] = useState({
    type: 'note',
    faceValue: '',
    purchasePrice: '',
    purchaseDate: '',
    maturityDate: '',
    couponRate: '',
    issueDate: '',
    description: ''
  })

  // Load user-specific data from localStorage
  useEffect(() => {
    const userKey = `treasuryInvestments_${user.email}`
    const savedInvestments = localStorage.getItem(userKey)
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments))
    }
  }, [user.email])

  // Save user-specific data to localStorage
  useEffect(() => {
    const userKey = `treasuryInvestments_${user.email}`
    localStorage.setItem(userKey, JSON.stringify(investments))
  }, [investments, user.email])

  // Calculate coupon payment schedule for treasury notes
  const calculateCouponSchedule = (investment) => {
    if (investment.type === 'bill') {
      return [{
        date: investment.maturityDate,
        amount: investment.faceValue,
        type: 'maturity',
        description: 'Maturity Payment'
      }]
    }

    const schedule = []
    const issueDate = new Date(investment.issueDate)
    const maturityDate = new Date(investment.maturityDate)
    const couponRate = parseFloat(investment.couponRate) / 100
    const semiAnnualPayment = (investment.faceValue * couponRate) / 2

    // Generate semi-annual payment dates starting 6 months from issue date
    let currentDate = new Date(issueDate)
    currentDate.setMonth(currentDate.getMonth() + 6)

    while (currentDate <= maturityDate) {
      const isMaturityDate = currentDate.getTime() === maturityDate.getTime() || 
                            (currentDate.getFullYear() === maturityDate.getFullYear() && 
                             currentDate.getMonth() === maturityDate.getMonth() && 
                             currentDate.getDate() === maturityDate.getDate())
      
      if (isMaturityDate) {
        // Final payment includes coupon + principal
        schedule.push({
          date: currentDate.toISOString().split('T')[0],
          amount: semiAnnualPayment + investment.faceValue,
          type: 'final',
          description: 'Final Coupon + Principal'
        })
        break
      } else {
        schedule.push({
          date: currentDate.toISOString().split('T')[0],
          amount: semiAnnualPayment,
          type: 'coupon',
          description: 'Semi-annual Coupon'
        })
      }
      currentDate.setMonth(currentDate.getMonth() + 6)
    }

    // If we haven't reached maturity date exactly, add final payment
    if (schedule.length === 0 || schedule[schedule.length - 1].type !== 'final') {
      schedule.push({
        date: maturityDate.toISOString().split('T')[0],
        amount: semiAnnualPayment + investment.faceValue,
        type: 'final',
        description: 'Final Coupon + Principal'
      })
    }

    return schedule
  }

  // Calculate portfolio statistics
  const getPortfolioStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeInvestments = investments.filter(inv => {
      const maturityDate = new Date(inv.maturityDate)
      maturityDate.setHours(0, 0, 0, 0)
      return maturityDate >= today
    })
    
    const totalInvestment = activeInvestments.reduce((sum, inv) => sum + inv.faceValue, 0)
    const totalPurchasePrice = activeInvestments.reduce((sum, inv) => sum + inv.purchasePrice, 0)
    
    let totalExpectedReturns = 0
    let nextPayment = null
    let nextPaymentDate = null

    activeInvestments.forEach(investment => {
      const schedule = calculateCouponSchedule(investment)
      const futurePayments = schedule.filter(payment => {
        const paymentDate = new Date(payment.date)
        paymentDate.setHours(0, 0, 0, 0)
        return paymentDate >= today
      })
      
      totalExpectedReturns += futurePayments.reduce((sum, payment) => sum + payment.amount, 0)
      
      // Find next payment
      futurePayments.forEach(payment => {
        const paymentDate = new Date(payment.date)
        if (!nextPaymentDate || paymentDate < nextPaymentDate) {
          nextPaymentDate = paymentDate
          nextPayment = { ...payment, investment: investment.description || `${investment.type.toUpperCase()} ${investment.faceValue}` }
        }
      })
    })

    return {
      totalInvestments: activeInvestments.length,
      totalInvestment,
      totalPurchasePrice,
      totalExpectedReturns,
      expectedProfit: totalExpectedReturns - totalPurchasePrice,
      nextPayment,
      nextPaymentDate
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newInvestment = {
      id: editingInvestment ? editingInvestment.id : Date.now().toString(),
      ...formData,
      faceValue: parseFloat(formData.faceValue),
      purchasePrice: parseFloat(formData.purchasePrice),
      couponRate: formData.type === 'note' ? parseFloat(formData.couponRate) : 0,
      createdAt: editingInvestment ? editingInvestment.createdAt : new Date().toISOString()
    }

    if (editingInvestment) {
      setInvestments(investments.map(inv => inv.id === editingInvestment.id ? newInvestment : inv))
    } else {
      setInvestments([...investments, newInvestment])
    }

    // Reset form
    setFormData({
      type: 'note',
      faceValue: '',
      purchasePrice: '',
      purchaseDate: '',
      maturityDate: '',
      couponRate: '',
      issueDate: '',
      description: ''
    })
    setShowAddForm(false)
    setEditingInvestment(null)
  }

  const handleEdit = (investment) => {
    setFormData({
      type: investment.type,
      faceValue: investment.faceValue.toString(),
      purchasePrice: investment.purchasePrice.toString(),
      purchaseDate: investment.purchaseDate,
      maturityDate: investment.maturityDate,
      couponRate: investment.couponRate.toString(),
      issueDate: investment.issueDate,
      description: investment.description || ''
    })
    setEditingInvestment(investment)
    setShowAddForm(true)
  }

  const handleDelete = (id) => {
    setInvestments(investments.filter(inv => inv.id !== id))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const isInvestmentMatured = (maturityDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maturity = new Date(maturityDate)
    maturity.setHours(0, 0, 0, 0)
    return maturity < today
  }

  const stats = getPortfolioStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Treasury Investment Tracker</h1>
              <p className="text-gray-600">Malawi Kwacha (MWK) Portfolio</p>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Investment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                    </DialogTitle>
                    <DialogDescription>
                      Enter the details of your treasury investment below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Investment Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="note">Treasury Note</SelectItem>
                            <SelectItem value="bill">Treasury Bill</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="e.g., 5-Year Note 2025"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="faceValue">Face Value (MWK)</Label>
                        <Input
                          id="faceValue"
                          type="number"
                          required
                          value={formData.faceValue}
                          onChange={(e) => setFormData({...formData, faceValue: e.target.value})}
                          placeholder="1000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchasePrice">Purchase Price (MWK)</Label>
                        <Input
                          id="purchasePrice"
                          type="number"
                          required
                          value={formData.purchasePrice}
                          onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                          placeholder="950000"
                        />
                      </div>
                    </div>

                    {formData.type === 'note' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="couponRate">Annual Coupon Rate (%)</Label>
                          <Input
                            id="couponRate"
                            type="number"
                            step="0.01"
                            required
                            value={formData.couponRate}
                            onChange={(e) => setFormData({...formData, couponRate: e.target.value})}
                            placeholder="5.25"
                          />
                        </div>
                        <div>
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input
                            id="issueDate"
                            type="date"
                            required
                            value={formData.issueDate}
                            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                        <Input
                          id="purchaseDate"
                          type="date"
                          required
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maturityDate">Maturity Date</Label>
                        <Input
                          id="maturityDate"
                          type="date"
                          required
                          value={formData.maturityDate}
                          onChange={(e) => setFormData({...formData, maturityDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowAddForm(false)
                        setEditingInvestment(null)
                        setFormData({
                          type: 'note',
                          faceValue: '',
                          purchasePrice: '',
                          purchaseDate: '',
                          maturityDate: '',
                          couponRate: '',
                          issueDate: '',
                          description: ''
                        })
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {editingInvestment ? 'Update Investment' : 'Add Investment'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalInvestments} active investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalExpectedReturns)}</div>
              <p className="text-xs text-muted-foreground">
                Profit: {formatCurrency(stats.expectedProfit)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.nextPayment ? formatCurrency(stats.nextPayment.amount) : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.nextPaymentDate ? formatDate(stats.nextPaymentDate.toISOString().split('T')[0]) : 'No upcoming payments'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Yield</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPurchasePrice > 0 ? 
                  ((stats.expectedProfit / stats.totalPurchasePrice) * 100).toFixed(2) + '%' : 
                  '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Expected return on investment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <CardTitle>Investment Portfolio</CardTitle>
                <CardDescription>
                  Manage your treasury notes and bills
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No investments</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first treasury investment.</p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Investment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Face Value</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Coupon Rate</TableHead>
                        <TableHead>Maturity Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investments.map((investment) => {
                        const isMatured = isInvestmentMatured(investment.maturityDate)
                        return (
                          <TableRow key={investment.id}>
                            <TableCell>
                              <Badge variant={investment.type === 'note' ? 'default' : 'secondary'}>
                                {investment.type === 'note' ? 'Note' : 'Bill'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {investment.description || `${investment.type.toUpperCase()} ${formatCurrency(investment.faceValue)}`}
                            </TableCell>
                            <TableCell>{formatCurrency(investment.faceValue)}</TableCell>
                            <TableCell>{formatCurrency(investment.purchasePrice)}</TableCell>
                            <TableCell>
                              {investment.type === 'note' ? `${investment.couponRate}%` : 'N/A'}
                            </TableCell>
                            <TableCell>{formatDate(investment.maturityDate)}</TableCell>
                            <TableCell>
                              <Badge variant={isMatured ? 'destructive' : 'default'}>
                                {isMatured ? 'Matured' : 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(investment)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(investment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="space-y-6">
              {investments.map((investment) => {
                const schedule = calculateCouponSchedule(investment)
                return (
                  <Card key={investment.id}>
                    <CardHeader>
                      <CardTitle>
                        {investment.description || `${investment.type.toUpperCase()} ${formatCurrency(investment.faceValue)}`}
                      </CardTitle>
                      <CardDescription>
                        {investment.type === 'note' ? 
                          `${investment.couponRate}% Annual Coupon Rate - Semi-annual Payments` :
                          'Treasury Bill - Single Payment at Maturity'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.map((payment, index) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const paymentDate = new Date(payment.date)
                            paymentDate.setHours(0, 0, 0, 0)
                            const isPast = paymentDate < today
                            return (
                              <TableRow key={index}>
                                <TableCell>{formatDate(payment.date)}</TableCell>
                                <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
                                <TableCell>
                                  <Badge variant={payment.type === 'final' ? 'destructive' : 'default'}>
                                    {payment.description}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={isPast ? 'secondary' : 'default'}>
                                    {isPast ? 'Due' : 'Pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )
              })}
              {investments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No payment schedules</h3>
                    <p className="mt-1 text-sm text-gray-500">Add investments to see their payment schedules.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard

