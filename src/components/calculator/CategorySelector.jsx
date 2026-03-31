import { useNavigate } from "react-router-dom";
import "./CategorySelector.css";

const categories = [
  {
    id: "misthotoi",
    title: "Μισθωτοί",
    description: "Απλά ή βαρέα ένσημα",
    helper: "Για γενικές περιπτώσεις μισθωτών",
    active: true,
    path: "/calculator/misthotoi",
    accent: "blue",
    badge: "Ενεργό",
  },
  {
    id: "deh",
    title: "Υπερβαρέα ΔΕΗ",
    description: "Υπάλληλοι ΔΕΗ με υπερβαρέα",
    helper: "Ειδική διαδρομή για περιπτώσεις ΔΕΗ",
    active: true,
    path: "/calculator/dei",
    accent: "orange",
    badge: "Ενεργό",
  },
  {
    id: "stratiotikoi",
    title: "Στρατιωτικοί",
    description: "Μελλοντική κατηγορία",
    helper: "Θα προστεθεί σε επόμενο στάδιο",
    active: false,
    badge: "Σύντομα",
  },
  {
    id: "ee",
    title: "ΕΕ",
    description: "Μελλοντική κατηγορία",
    helper: "Για διαδρομές με ευρωπαϊκή ασφάλιση",
    active: false,
    badge: "Σύντομα",
  },
  {
    id: "loipes",
    title: "Λοιπές κατηγορίες",
    description: "Θα προστεθούν σταδιακά",
    helper: "Νέες περιπτώσεις θα ενσωματώνονται σταδιακά",
    active: false,
    badge: "Σύντομα",
    wide: true,
  },
];

function CategorySelector() {
  const navigate = useNavigate();

  return (
    <section className="category-selector-section">
      <div className="category-selector-container">
        <div className="category-selector-header">
          <span className="category-selector-badge">Υπολογισμός σύνταξης</span>
          <h1>Επιλέξτε κατηγορία ασφαλισμένου</h1>
          <p>
            Ξεκινήστε από την κατηγορία που σας αφορά, ώστε να ανοίξει η σωστή
            διαδρομή υπολογισμού με τα αντίστοιχα στοιχεία.
          </p>
        </div>

        <div className="category-selector-grid">
          {categories.map((category) => {
            const cardClassName = [
              "category-card",
              category.active ? "category-card--active" : "category-card--disabled",
              category.accent ? `category-card--${category.accent}` : "",
              category.wide ? "category-card--wide" : "",
            ]
              .filter(Boolean)
              .join(" ");

            if (category.active) {
              return (
                <button
                  key={category.id}
                  type="button"
                  className={cardClassName}
                  onClick={() => navigate(category.path)}
                >
                  <div className="category-card-top">
                    <span className="category-card-pill">{category.badge}</span>
                  </div>

                  <div className="category-card-content">
                    <h2>{category.title}</h2>
                    <p className="category-card-description">{category.description}</p>
                    <p className="category-card-helper">{category.helper}</p>
                  </div>

                  <div className="category-card-action-row">
                    <span className="category-card-action">Συνέχεια</span>
                    <span className="category-card-arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <div
                key={category.id}
                className={cardClassName}
                aria-disabled="true"
              >
                <div className="category-card-top">
                  <span className="category-card-pill category-card-pill--muted">
                    {category.badge}
                  </span>
                </div>

                <div className="category-card-content">
                  <h2>{category.title}</h2>
                  <p className="category-card-description">{category.description}</p>
                  <p className="category-card-helper">{category.helper}</p>
                </div>

                <div className="category-card-action-row">
                  <span className="category-card-soon">Σύντομα διαθέσιμο</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategorySelector;
