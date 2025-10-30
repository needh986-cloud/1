import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { levelUpgradeService } from '../../services/levelUpgradeService';
import { adminSettingsService } from '../../services/adminSettingsService';
import { useAuth } from '../../contexts/AuthContext';

const LevelUpgrade = () => {
  const { user, profile } = useAuth();
  const [upgrades, setUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [paymentProof, setPaymentProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [depositAddresses, setDepositAddresses] = useState([]);

  const currentLevel = profile?.level || 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadAvailableUpgrades(),
      loadMyRequests(),
      loadDepositAddresses()
    ]);
    setLoading(false);
  };

  const loadAvailableUpgrades = async () => {
    const { upgrades: data } = await levelUpgradeService.getAvailableUpgrades(currentLevel);
    setUpgrades(data || []);
  };

  const loadMyRequests = async () => {
    const { requests } = await levelUpgradeService.getUserUpgradeRequests(user.id);
    setMyRequests(requests || []);
  };

  const loadDepositAddresses = async () => {
    // Get USDT addresses from settings
    const { setting } = await adminSettingsService.getSetting('usdt_deposit_addresses');
    if (setting?.value) {
      try {
        const addresses = JSON.parse(setting.value);
        setDepositAddresses(addresses);
      } catch (e) {
        setDepositAddresses([]);
      }
    }
  };

  const handleSelectLevel = (level, price) => {
    setSelectedLevel({ level, price });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLevel) return;

    setSubmitting(true);
    const { result } = await levelUpgradeService.requestUpgrade(
      user.id,
      selectedLevel.level,
      paymentProof
    );

    if (result?.success) {
      alert('Upgrade request submitted successfully! Awaiting admin approval.');
      setSelectedLevel(null);
      setPaymentProof('');
      await loadMyRequests();
    } else {
      alert('Error submitting upgrade request. Please try again.');
    }
    setSubmitting(false);
  };

  const levelBenefits = {
    1: ['Higher task rewards', 'Priority support', 'Exclusive offers', 'Referral bonuses'],
    2: ['Premium rewards', 'VIP support', 'Better referral system', 'Special tasks'],
    3: ['Elite rewards', 'Dedicated support', 'Maximum benefits', 'Lifetime perks']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Level Upgrade - PromoHive</title>
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Icon name="TrendingUp" size={32} />
                Upgrade Your Level
              </h1>
              <p className="text-text-secondary mt-2">
                Unlock premium features and higher rewards
              </p>
            </div>
            <Link
              to="/user-dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition"
            >
              <Icon name="ArrowLeft" size={20} />
              Back
            </Link>
          </div>

          {/* Current Level */}
          <div className="glass rounded-xl p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary mb-1">Your Current Level</p>
                <p className="text-5xl font-bold text-primary">Level {currentLevel}</p>
              </div>
              {currentLevel < 3 && (
                <Icon name="ArrowUpCircle" size={64} className="text-primary opacity-20" />
              )}
            </div>
          </div>

          {/* Available Upgrades */}
          {upgrades.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Available Upgrades</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {upgrades.map(upgrade => (
                  <div
                    key={upgrade.level}
                    className={`glass rounded-xl p-6 hover:shadow-xl transition cursor-pointer ${
                      selectedLevel?.level === upgrade.level ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectLevel(upgrade.level, upgrade.price)}
                  >
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl font-bold text-white">L{upgrade.level}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Level {upgrade.level}</h3>
                      <p className="text-3xl font-bold text-primary mt-2">${upgrade.price}</p>
                      <p className="text-sm text-text-secondary">One-time payment</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {levelBenefits[upgrade.level]?.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Icon name="Check" size={16} className="text-success" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        selectedLevel?.level === upgrade.level
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {selectedLevel?.level === upgrade.level ? 'Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center mb-8">
              <Icon name="Award" size={48} className="mx-auto text-success mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Maximum Level Reached!</h3>
              <p className="text-text-secondary">
                You're already at the highest level. Enjoy all premium benefits!
              </p>
            </div>
          )}

          {/* Payment Form */}
          {selectedLevel && (
            <div className="glass rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Complete Your Upgrade</h2>
              
              {/* Deposit Instructions */}
              <div className="bg-primary/5 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-primary" />
                  Payment Instructions
                </h3>
                <div className="space-y-3 text-sm">
                  <p>1. Send <strong className="text-primary">${selectedLevel.price} USDT</strong> to one of the addresses below</p>
                  <p>2. Save the transaction hash or screenshot</p>
                  <p>3. Submit your payment proof below</p>
                  <p>4. Wait for admin verification (usually within 24 hours)</p>
                </div>
              </div>

              {/* Deposit Addresses */}
              {depositAddresses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">USDT Deposit Addresses:</h4>
                  <div className="space-y-2">
                    {depositAddresses.map((addr, i) => (
                      <div key={i} className="glass p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-text-secondary mb-1">{addr.network}</p>
                            <p className="font-mono text-sm">{addr.address}</p>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(addr.address)}
                            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                            title="Copy Address"
                          >
                            <Icon name="Copy" size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Payment Proof (Transaction Hash or Screenshot URL)
                  </label>
                  <input
                    type="text"
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                    placeholder="Enter transaction hash or upload screenshot URL"
                    className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
                    required
                  />
                  <p className="text-xs text-text-secondary mt-2">
                    You can paste the transaction hash or a link to your payment screenshot
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !paymentProof}
                  className="w-full py-4 bg-gradient-primary text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : `Submit Upgrade Request for Level ${selectedLevel.level}`}
                </button>
              </form>
            </div>
          )}

          {/* My Requests */}
          {myRequests.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Upgrade Requests</h2>
              <div className="space-y-3">
                {myRequests.map(request => (
                  <div key={request.id} className="glass rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Level {request.from_level} → Level {request.to_level}
                        </h3>
                        <p className="text-text-secondary text-sm mb-2">
                          Amount: ${request.price}
                        </p>
                        {request.payment_proof && (
                          <p className="text-text-secondary text-sm mb-2">
                            Proof: {request.payment_proof.substring(0, 40)}...
                          </p>
                        )}
                        <p className="text-xs text-text-secondary">
                          Submitted: {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        request.status === 'verified' 
                          ? 'bg-success/20 text-success' 
                          : request.status === 'pending'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {request.status === 'verified' ? 'Approved' : 
                         request.status === 'pending' ? 'Pending' : 'Rejected'}
                      </span>
                    </div>
                    {request.rejection_reason && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm text-destructive">
                          <strong>Reason:</strong> {request.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LevelUpgrade;
