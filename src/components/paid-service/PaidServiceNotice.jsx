import React from 'react';
import { Link } from 'react-router-dom';
import './PaidServiceNotice.css';

export default function PaidServiceNotice({ title = 'Σύντομα διαθέσιμο', children, page = false, recovery = false }) {
  const Heading = page ? 'h1' : 'h2';
  const notice = (
    <section className="paid-service-notice">
      <Heading>{title}</Heading>
      <p>{children}</p>
      <div className="paid-service-notice-actions">
        <Link to={recovery ? '/report-guide' : '/contact'} className="paid-service-notice-primary">
          {recovery ? 'Δείτε την Αναλυτική Έκθεση' : 'Επικοινωνήστε μαζί μας'}
        </Link>
        {page && (
          <Link to={recovery ? '/contact' : '/free-guide'}>
            {recovery ? 'Επικοινωνήστε μαζί μας' : 'Δωρεάν Εκτίμηση'}
          </Link>
        )}
      </div>
    </section>
  );
  return page ? <main className="paid-service-unavailable">{notice}</main> : notice;
}

export function UploadPrelaunchPage() {
  return (
    <PaidServiceNotice page title="Αναλυτική Έκθεση — σύντομα διαθέσιμη">
      Η online αποστολή εγγράφων για την Αναλυτική Έκθεση δεν είναι ακόμη ενεργή.
      Αν θέλετε να μας περιγράψετε την περίπτωσή σας ή να ρωτήσετε για τη διαθεσιμότητα
      της υπηρεσίας, επικοινωνήστε μαζί μας.
    </PaidServiceNotice>
  );
}

export function RecoveryPrelaunchPage() {
  return (
    <PaidServiceNotice page recovery title="Αναλυτική Έκθεση — σύντομα διαθέσιμη">
      Η online υπηρεσία Αναλυτικής Έκθεσης δεν έχει ακόμη ξεκινήσει.
      Μπορείτε να μάθετε πώς θα λειτουργεί ή να επικοινωνήσετε μαζί μας.
    </PaidServiceNotice>
  );
}
