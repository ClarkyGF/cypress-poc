describe("Cypress demo scenario", () => {
  let originTotal;

  Cypress.Commands.add("waitForLoaderToDisappear", () => {
    cy.get(".Loader").should("exist");

    cy.get(".Loader").should("not.exist");
  });

  before(() => {
    const username = "username";
    const password = "password";

    cy.visit("/#/login");

    cy.get("#username", { timeout: 10000 })
      .type(username)
      .should("have.value", username);

    cy.get("#password").type(password).should("have.value", password);

    cy.get("#submit").click().should("have.attr", "disabled");

    cy.get(".navbar").should("exist");
  });

  beforeEach(() => {
    cy.visit("/#/catalog/all");

    cy.waitForLoaderToDisappear();

    cy.get("[data-testid='Modal-confirm']", {
      timeout: 10000,
    }).then(($element) => {
      if ($element && $element.is(":visible")) {
        cy.wrap($element).click().should("not.exist");
      }
    });
    cy.waitForLoaderToDisappear();

    cy.get(".ListPaginationInfo__total")
      .as("originTotal")
      .invoke("text")
      .then((text) => {
        originTotal = text;
      });
  });

  it("Interact with products", () => {
    cy.get(".ListTableRow").should("have.length", 20);

    cy.get("#list-actions-select-all").click();

    cy.get(".ListTableRow--selected").should("have.length", 20);

    cy.get("@originTotal").should("have.text", originTotal);

    cy.get("#list-actions-select-all").click();

    cy.get(".ListTableRow--selected").should("have.length", 0);

    cy.get(".CatalogCellActionWrapper--link").eq(0).click();

    cy.waitForLoaderToDisappear();

    cy.get(".ProductFooter").should("be.visible");
  });

  it("Interact with filters", () => {
    let filter1Total;

    cy.get(".SourceProductStatusFilter--DRAFT").should("be.visible").click();

    cy.waitForLoaderToDisappear();

    cy.get("@originTotal")
      .should("not.have.text", originTotal)
      .invoke("text")
      .then((text) => {
        filter1Total = text;
      })
      .then(() => {
        cy.get("#list-filter-packshot").then(($element) => {
          if (
            $element.attr("class").includes("ListCollapsibleFilter--collapsed")
          ) {
            cy.wrap($element).find("button").click();
          }
          cy.wrap($element).find(".ListSimpleFilterItem").eq(0).click();
          // cy.waitForLoaderToDisappear();
        });

        cy.get("@originTotal")
          .should("not.have.text", originTotal)
          .should("not.have.text", filter1Total);

        cy.get(".ListSelectedFilters_remove").click();

        cy.get("@originTotal").should("have.text", originTotal);
      });
  });

  it("Search in catalog", () => {
    cy.get("[data-testid='ProductReference__copyWrapper']")
      .first()
      .invoke("text")
      .then((text) => {
        const gtin = text;
        cy.get(".Search .Search__input").type(gtin);
        cy.waitForLoaderToDisappear();
        cy.get(".ListTableRow").each(($row) => {
          cy.wrap($row)
            .find("[data-code='GTIN']")
            .invoke("text")
            .should("contain", gtin);
        });
      });

    const text = "KAT";

    cy.get(".Search .Search__input").clear().type(text);

    cy.waitForLoaderToDisappear();

    cy.get("@originTotal").should("not.have.text", originTotal);

    cy.get(".ListTableRow").each(($row) => {
      cy.wrap($row)
        .find("[data-code='NAME']")
        .invoke("text")
        .should("contain", text);
    });
  });

  it("Export product", () => {
    cy.get("[id^='catalog-row-checkbox-']").eq(0).click();

    cy.get(".Dropdown__button")
      .eq(0)
      .should("contain", "Exporter 1")
      .click()
      .then(() => {
        cy.contains("Export fiche produit").click();
      });

    cy.get(".CatalogExportModal").then(($modal) => {
      cy.wrap($modal)
        .find("#SimpleSelect-catalog-export-modal-format-selector")
        .should("be.visible");
      cy.wrap($modal)
        .find(".Modal__footerCloseButton")
        .should("be.visible")
        .click()
        .should("not.exist");
    });
  });
});
