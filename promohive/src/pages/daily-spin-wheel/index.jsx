import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SpinWheel from './components/SpinWheel';
import UsageInfo from './components/UsageInfo';
import PrizeHistory from './components/PrizeHistory';
import WinCelebration from './components/WinCelebration';
import RulesInfo from './components/RulesInfo';

const DailySpinWheel = () => {
  const [user, setUser] = useState(null);
  const [spinData, setSpinData] = useState({
    remainingSpins: 3,
    maxSpins: 3,
    nextResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)?.toISOString()
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [winHistory, setWinHistory] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentWin, setCurrentWin] = useState(null);

  // Mock prizes data
  const prizes = [
    { 
      amount: 0.50, 
      type: 'cash', 
      icon: 'DollarSign',
      description: "Nice! You\'ve won $0.50 cash prize!"
    },
    { 
      amount: 2.00, 
      type: 'bonus', 
      icon: 'Star',
      description: "Great! You\'ve won a $2.00 bonus prize!"
    },
    { 
      amount: 1.00, 
      type: 'cash', 
      icon: 'DollarSign',
      description: "Awesome! You\'ve won $1.00 cash prize!"
    },
    { 
      amount: 5.00, 
      type: 'multiplier', 
      icon: 'Zap', 
      multiplier: 2,
      description: "Amazing! You\'ve won $5.00 with a 2x multiplier!"
    },
    { 
      amount: 0.25, 
      type: 'cash', 
      icon: 'DollarSign',
      description: "You\'ve won $0.25 cash prize!"
    },
    { 
      amount: 10.00, 
      type: 'special', 
      icon: 'Gift',
      description: "Incredible! You\'ve won a special $10.00 prize!"
    },
    { 
      amount: 0.75, 
      type: 'cash', 
      icon: 'DollarSign',
      description: "Good job! You\'ve won $0.75 cash prize!"
    },
    { 
      amount: 3.00, 
      type: 'bonus', 
      icon: 'Star',
      description: "Excellent! You\'ve won a $3.00 bonus prize!"
    }
  ];

  useEffect(() => {
    // Simulate user data
    const userData = {
      id: 1,
      name: 'John Doe',
      email: 'john@promohive.com',
      balance: 1250.75,
      totalEarnings: 2847.50
    };
    setUser(userData);

    // Load existing win history from localStorage or use mock data
    const savedHistory = localStorage.getItem('spinWinHistory');
    if (savedHistory) {
      setWinHistory(JSON.parse(savedHistory));
    } else {
      // Mock recent wins
      const mockHistory = [
        {
          amount: 2.50,
          type: 'bonus',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)?.toISOString(),
          multiplier: null
        },
        {
          amount: 0.75,
          type: 'cash',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)?.toISOString(),
          multiplier: null
        }
      ];
      setWinHistory(mockHistory);
    }

    // Load spin data from localStorage
    const savedSpinData = localStorage.getItem('dailySpinData');
    if (savedSpinData) {
      const parsed = JSON.parse(savedSpinData);
      const now = new Date();
      const resetTime = new Date(parsed.nextResetTime);
      
      // Check if it's a new day
      if (now >= resetTime) {
        // Reset spins for new day
        const newResetTime = new Date(now);
        newResetTime?.setDate(newResetTime?.getDate() + 1);
        newResetTime?.setHours(0, 0, 0, 0);
        
        const newSpinData = {
          remainingSpins: 3,
          maxSpins: 3,
          nextResetTime: newResetTime?.toISOString()
        };
        setSpinData(newSpinData);
        localStorage.setItem('dailySpinData', JSON.stringify(newSpinData));
        
        // Clear history for new day
        setWinHistory([]);
        localStorage.removeItem('spinWinHistory');
      } else {
        setSpinData(parsed);
      }
    }
  }, []);

  const handleSpin = (winningPrize) => {
    if (spinData?.remainingSpins <= 0) return;

    setIsSpinning(true);

    // Simulate spin delay
    setTimeout(() => {
      const newWin = {
        ...winningPrize,
        timestamp: new Date()?.toISOString()
      };

      // Update win history
      const updatedHistory = [newWin, ...winHistory];
      setWinHistory(updatedHistory);
      localStorage.setItem('spinWinHistory', JSON.stringify(updatedHistory));

      // Update remaining spins
      const updatedSpinData = {
        ...spinData,
        remainingSpins: spinData?.remainingSpins - 1
      };
      setSpinData(updatedSpinData);
      localStorage.setItem('dailySpinData', JSON.stringify(updatedSpinData));

      // Update user balance (in real app, this would be an API call)
      setUser(prev => ({
        ...prev,
        balance: prev?.balance + winningPrize?.amount,
        totalEarnings: prev?.totalEarnings + winningPrize?.amount
      }));

      // Show celebration
      setCurrentWin(newWin);
      setShowCelebration(true);
      setIsSpinning(false);
    }, 4000);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setCurrentWin(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Icon name="RotateCcw" size={24} color="white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
              Daily Spin Wheel
            </h1>
          </div>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Spin the wheel daily for amazing prizes! Win cash rewards, bonuses, and special multipliers.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto mb-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/user-dashboard" className="text-text-secondary hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Icon name="ChevronRight" size={14} className="text-text-secondary" />
            <span className="text-foreground font-medium">Daily Spin Wheel</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Usage Information */}
          <UsageInfo 
            remainingSpins={spinData?.remainingSpins}
            maxSpins={spinData?.maxSpins}
            nextResetTime={spinData?.nextResetTime}
          />

          {/* Spin Wheel */}
          <div className="flex justify-center">
            <SpinWheel
              prizes={prizes}
              onSpin={handleSpin}
              isSpinning={isSpinning}
              canSpin={spinData?.remainingSpins > 0}
            />
          </div>

          {/* Current Balance Display */}
          {user && (
            <div className="flex justify-center">
              <div className="glass rounded-xl p-6 border border-border">
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-2">Current Balance</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="Wallet" size={20} className="text-success" />
                    <span className="text-2xl font-bold text-success font-data">
                      ${user?.balance?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Total Earnings: ${user?.totalEarnings?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prize History */}
          <PrizeHistory history={winHistory} />

          {/* Rules and Information */}
          <RulesInfo />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/wallet-overview">
              <Button variant="outline" className="w-full sm:w-auto">
                <Icon name="Wallet" size={16} className="mr-2" />
                View Wallet
              </Button>
            </Link>
            <Link to="/user-dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <Icon name="Home" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Tips Section */}
          <div className="glass rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="Lightbulb" size={20} className="text-warning" />
              <span>Pro Tips</span>
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Icon name="Clock" size={16} className="text-primary mt-1" />
                <div>
                  <p className="font-medium text-foreground">Daily Routine</p>
                  <p className="text-sm text-text-secondary">
                    Visit daily to maximize your earning potential with free spins.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Icon name="Target" size={16} className="text-success mt-1" />
                <div>
                  <p className="font-medium text-foreground">Complete Tasks</p>
                  <p className="text-sm text-text-secondary">
                    Bonus multipliers from spins apply to your next task rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Win Celebration Modal */}
      <WinCelebration
        prize={currentWin}
        isVisible={showCelebration}
        onClose={closeCelebration}
      />
    </div>
  );
};

export default DailySpinWheel;