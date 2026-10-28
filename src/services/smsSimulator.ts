export interface BankSMSTemplate {
  id: string;
  bankName: string;
  country: string;
  sampleMessage: string;
  sender: string;
}

export const SAMPLE_BANK_SMS: BankSMSTemplate[] = [
  {
    id: 'chase_debit',
    bankName: 'Chase Bank (US)',
    country: 'US',
    sender: 'CHASE',
    sampleMessage: 'Chase: You made a $42.50 transaction with your card ending in 1234 at WHOLE FOODS MARKET on Oct 28.',
  },
  {
    id: 'amex_charge',
    bankName: 'American Express (US)',
    country: 'US',
    sender: 'AMEX',
    sampleMessage: 'Alert: A charge of USD 120.00 was approved on your Amex Card ending 9876 at TARGET on 10/28/2026.',
  },
  {
    id: 'hdfc_upi',
    bankName: 'HDFC Bank UPI (India)',
    country: 'IN',
    sender: 'HDFCBK',
    sampleMessage: 'Rs 349.00 debited from a/c **4821 on 28-OCT-26 to VPA swiggy@icici (UPI Ref 4298127391). Avail Bal: Rs 14,200.00',
  },
  {
    id: 'sbi_salary',
    bankName: 'SBI Salary Credit (India)',
    country: 'IN',
    sender: 'SBIBNK',
    sampleMessage: 'Dear SBI User, your A/C 9876 credited by Rs 75,000.00 on 28Oct26 by transfer from TECH CORP. Avail Bal: Rs 82,300',
  },
  {
    id: 'barclays_card',
    bankName: 'Barclays (£)',
    country: 'UK',
    sender: 'BARCLAYS',
    sampleMessage: 'Paid £14.50 to Pret A Manger using card ending 3311 on 28 Oct.',
  },
  {
    id: 'gpay_push',
    bankName: 'Google Pay Notification',
    country: 'Global',
    sender: 'Google Pay',
    sampleMessage: 'Paid $18.50 to Starbucks on card ending 4412',
  },
  {
    id: 'otp_filter',
    bankName: 'OTP Security Code (Test Filter)',
    country: 'Global',
    sender: 'BANK_OTP',
    sampleMessage: 'Your one time password (OTP) for transaction of $50.00 at Walmart is 849201. Do not share with anyone.',
  },
];
