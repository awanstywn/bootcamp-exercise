# REST API Bus Schedule
A comprehensive *Express + TypeScript* API tailored towards scheduling buses, utilizing local *JSON* base persistence, dynamic array parameter filters, systematic Node error management, and strictly type-safe compilation.

## 🚀 App Features
*   **Modular Architecture**: MVC abstraction (*Route, Controller, Service*) cleanly separated to accommodate scalable future logic integrations.
*   **Endpoint Parameter Validation**: Proactive renegade interceptions terminating *Bad Requests* early without choking application integrity.
*   **Persistent Flat-file storage**: Implements natively parsed JSON rows, supplying a faster simulated persistent database interface with lower footprint requirements.
*   **TypeScript Strict/Type Safety**: Enforces stringent Type interfaces to prohibit properties/models absent across system structures while completely supporting ES Modules TS NodeNext imports.

## 📦 Running The Project
1. **Initial Project Installation (Performed Once)**:
   ```bash
   npm install
   ```
2. **Boot Developer Mode (Supported Automatic Restarts via tsx)**:
   ```bash
   npm run dev
   ```
3.  **Compile & Run for Standard Immutable Production Build**:
    ```bash
    npm run build
    npm run start
    ```

## 🔧 REST Endpoints

-   **`GET /routes`**: Extracts the comprehensive Bus schedule directory.
-   **`GET /routes/:id`**: Requests data for specifically distinct IDs (Example parameter: `/routes/JKT-SUB`).
-   **`GET /routes?count=x`**: Shrinks overall fetch-sizes across large arrays by an external row quota (1 directly up to length) using `count` queries.
-   **`GET /routes?destination=x`**: Triggers explicit sorting logic targeting unique Destination identities (E.g. `SUB`, `JKT`, etc).
-   **`GET /routes?arrival=XXXX-XX-XX`**: Parses ISO string fragments mapping exclusively to specified exact Date/Calendars (*Example: 2026-05-01*).
