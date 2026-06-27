// AUTO-GENERATED from GeodoraPensionEngine/src/constants/shared/insuranceFundWorkTypeRules.json.
// Source SHA-256: 1762c2b4ddbdc2cb86861400604444fbb06beadd18ddbcb099665b572c0f7317
// Edit the Engine JSON and run `npm run sync:work-types` from GeodoraPensionEngine.

const INSURANCE_FUND_WORK_TYPE_RULES = Object.freeze({
  "schemaVersion": 1,
  "source": "GeodoraPensionEngine/src/constants/shared/insuranceFundWorkTypeRules.json",
  "categories": {
    "common": {
      "label": "Απλά ένσημα"
    },
    "vae": {
      "label": "ΒΑΕ"
    },
    "yvae": {
      "label": "ΥΒΑΕ"
    },
    "ota_ika_vae": {
      "label": "ΒΑΕ με καθεστώς ΟΤΑ"
    },
    "ota_public_vae": {
      "label": "ΒΑΕ με καθεστώς Δημοσίου"
    },
    "ota_ika_yvae": {
      "label": "ΥΒΑΕ μόνο για παλαιούς",
      "insuredTypes": [
        "old"
      ]
    },
    "contributions": {
      "label": "Με εισφορές / ασφαλιστική κατηγορία"
    }
  },
  "funds": {
    "ika": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "ika_vae",
          "premiumRules": [
            {
              "ruleId": "ika_general_vae_old_until_2016",
              "insuredType": "old",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.75,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            },
            {
              "ruleId": "ika_general_vae_new_until_2016",
              "insuredType": "new",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": true,
          "contributionCategory": "underground_underwater",
          "premiumRules": [
            {
              "ruleId": "underground_underwater_extra_until_2012",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2012-04-30",
              "extraContributionPoints": 7.5,
              "premiumType": "yvae",
              "exclusionFlag": "usesSpecialYVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            },
            {
              "ruleId": "underground_underwater_extra_from_2012",
              "insuredType": "any",
              "fromDate": "2012-05-01",
              "toDate": null,
              "extraContributionPoints": 7,
              "premiumType": "yvae",
              "exclusionFlag": "usesSpecialYVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        }
      }
    },
    "public_sector": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "uniformed": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "tanpy": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "deko": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "nat": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "aviation": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "artistic": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "banking_funds": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "tsay_salaried": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": false
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ota": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "ota_ika_vae": {
          "enabled": true,
          "contributionCategory": "ota_ika_vae",
          "premiumRules": [
            {
              "ruleId": "ota_ika_vae",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": null,
              "extraContributionPoints": 3.6,
              "premiumType": "ota_ika_vae",
              "exclusionFlag": "usesSpecialOtaIkaVaeRegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "ota_public_vae": {
          "enabled": true,
          "contributionCategory": "ota_public_vae",
          "premiumRules": [
            {
              "ruleId": "ota_public_vae",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": null,
              "extraContributionPoints": 4.3,
              "premiumType": "ota_public_vae",
              "exclusionFlag": "usesSpecialOtaPublicVaeRegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "ota_ika_yvae": {
          "enabled": true,
          "contributionCategory": "ota_ika_yvae",
          "insuredTypes": [
            "old"
          ],
          "premiumRules": [
            {
              "ruleId": "ota_ika_yvae_old",
              "insuredType": "old",
              "fromDate": "1987-03-13",
              "toDate": null,
              "extraContributionPoints": 7,
              "premiumType": "ota_ika_yvae",
              "exclusionFlag": "usesSpecialOtaIkaYvaeRegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        }
      }
    },
    "tap_dei": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${insuredType}_tap_dei_vae",
          "premiumRules": [
            {
              "ruleId": "tap_dei_old_vae_extra",
              "insuredType": "old",
              "fromDate": "1900-01-01",
              "toDate": null,
              "extraContributionPoints": 3.75,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            },
            {
              "ruleId": "tap_dei_new_vae_extra",
              "insuredType": "new",
              "fromDate": "1900-01-01",
              "toDate": null,
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": true,
          "contributionCategory": "tap_dei_yvae",
          "premiumRules": [
            {
              "ruleId": "tap_dei_yvae_extra_until_2012",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2012-04-30",
              "extraContributionPoints": 7.5,
              "premiumType": "yvae",
              "exclusionFlag": "usesSpecialYVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            },
            {
              "ruleId": "tap_dei_yvae_extra_from_2012",
              "insuredType": "any",
              "fromDate": "2012-05-01",
              "toDate": null,
              "extraContributionPoints": 7,
              "premiumType": "yvae",
              "exclusionFlag": "usesSpecialYVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        }
      }
    },
    "ika_tsp_hsap": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tsp_hsap_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_tsp_ete": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tsp_ete_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_tap_etba": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tap_etba_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "tapae_ethniki": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "tapae_ethniki_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "tseapgso": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "tseapgso_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_tap_ote_ote": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tap_ote_ote_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_tap_ote_ose_elta": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tap_ote_ose_elta_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_tap_ote_staff": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_tap_ote_staff_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "ika_npdd_special": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "ika_npdd_special_vae_until_2016",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "etap_mme_tattath": {
      "defaultCategory": "common",
      "categories": {
        "common": {
          "enabled": true,
          "default": true
        },
        "vae": {
          "enabled": true,
          "contributionCategory": "${fund}_vae",
          "premiumRules": [
            {
              "ruleId": "etap_mme_tattath_vae_until_2011",
              "insuredType": "any",
              "fromDate": "1900-01-01",
              "toDate": "2011-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            },
            {
              "ruleId": "etap_mme_tattath_vae_from_2015_to_2016",
              "insuredType": "any",
              "fromDate": "2015-08-01",
              "toDate": "2016-12-31",
              "extraContributionPoints": 3.6,
              "premiumType": "vae",
              "exclusionFlag": "usesSpecialVAERegime",
              "article30Eligible": true,
              "status": "confirmed"
            }
          ]
        },
        "yvae": {
          "enabled": false
        }
      }
    },
    "oaee": {
      "defaultCategory": "contributions",
      "categories": {
        "contributions": {
          "enabled": true,
          "default": true
        }
      }
    },
    "etaa": {
      "defaultCategory": "contributions",
      "categories": {
        "contributions": {
          "enabled": true,
          "default": true
        }
      }
    },
    "tsmede": {
      "defaultCategory": "contributions",
      "categories": {
        "contributions": {
          "enabled": true,
          "default": true
        }
      }
    },
    "tsay": {
      "defaultCategory": "contributions",
      "categories": {
        "contributions": {
          "enabled": true,
          "default": true
        }
      }
    },
    "oga": {
      "defaultCategory": "contributions",
      "categories": {
        "contributions": {
          "enabled": true,
          "default": true
        }
      }
    }
  }
});

const EMPLOYMENT_CATEGORY_DEFINITIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(
      INSURANCE_FUND_WORK_TYPE_RULES.categories || {},
    ).map(([value, definition]) => [
      value,
      Object.freeze({
        value,
        label: definition.label || value,
        insuredTypes: Array.isArray(definition.insuredTypes)
          ? Object.freeze([...definition.insuredTypes])
          : undefined,
      }),
    ]),
  ),
);

const FUND_WORK_TYPE_RULES = Object.freeze(
  INSURANCE_FUND_WORK_TYPE_RULES.funds || {},
);

function getFundWorkTypeRule(fund) {
  return FUND_WORK_TYPE_RULES[String(fund || '').trim()] || null;
}

function getEmploymentCategoryOptionsForFund(
  fund,
  { insuredType = '' } = {},
) {
  const rule = getFundWorkTypeRule(fund);

  if (!rule || !rule.categories) {
    return [];
  }

  return Object.entries(rule.categories)
    .filter(([, categoryRule]) => categoryRule?.enabled === true)
    .filter(([value, categoryRule]) => {
      const insuredTypes =
        categoryRule.insuredTypes ||
        EMPLOYMENT_CATEGORY_DEFINITIONS[value]?.insuredTypes;

      return (
        !Array.isArray(insuredTypes) ||
        insuredTypes.includes(insuredType)
      );
    })
    .map(([value]) => ({
      value,
      label:
        EMPLOYMENT_CATEGORY_DEFINITIONS[value]?.label || value,
    }));
}

function getDefaultEmploymentCategoryForFund(
  fund,
  { insuredType = '' } = {},
) {
  const rule = getFundWorkTypeRule(fund);
  const options = getEmploymentCategoryOptionsForFund(fund, {
    insuredType,
  });

  if (!rule || options.length === 0) {
    return '';
  }

  if (
    options.some(
      (option) => option.value === rule.defaultCategory,
    )
  ) {
    return rule.defaultCategory;
  }

  return options[0].value;
}

function isEmploymentCategoryAllowedForFund({
  fund,
  insuredType = '',
  employmentCategory,
}) {
  return getEmploymentCategoryOptionsForFund(fund, {
    insuredType,
  }).some(
    (option) => option.value === employmentCategory,
  );
}

function buildContributionCategoryForFundWorkType({
  fund,
  insuredType = '',
  employmentCategory,
}) {
  const categoryRule =
    getFundWorkTypeRule(fund)?.categories?.[
      String(employmentCategory || '').trim()
    ];

  if (!categoryRule || categoryRule.enabled !== true) {
    return null;
  }

  const template = String(
    categoryRule.contributionCategory || '',
  ).trim();

  if (!template) {
    return null;
  }

  return template.replace(/\$\{([^}]+)\}/g, (_, key) => {
    const replacements = {
      fund,
      insuredType,
      employmentCategory,
    };

    return String(replacements[key] ?? '');
  });
}

function getEmploymentCategoryLabel(value) {
  return (
    EMPLOYMENT_CATEGORY_DEFINITIONS[value]?.label ||
    value ||
    '—'
  );
}

export {
  EMPLOYMENT_CATEGORY_DEFINITIONS,
  FUND_WORK_TYPE_RULES,
  INSURANCE_FUND_WORK_TYPE_RULES,
  buildContributionCategoryForFundWorkType,
  getDefaultEmploymentCategoryForFund,
  getEmploymentCategoryLabel,
  getEmploymentCategoryOptionsForFund,
  getFundWorkTypeRule,
  isEmploymentCategoryAllowedForFund,
};
