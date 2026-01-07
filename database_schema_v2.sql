-- ============================================================================
-- Service Request Portal - Database Schema with REGOPS_APP naming convention
-- Schema: REGOPS_APP
-- Table naming: tbl_globi_eu_am_99_TableName
-- Based on URS Requirements (UR-028 to UR-052)
-- ============================================================================

-- Create schema if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'REGOPS_APP')
BEGIN
    EXEC('CREATE SCHEMA REGOPS_APP')
END
GO

-- ============================================================================
-- MASTER DATA TABLES
-- ============================================================================

-- Countries and supported languages (UR-030)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_Countries (
    CountryCode NVARCHAR(10) PRIMARY KEY,
    CountryName NVARCHAR(100) NOT NULL,
    IsActive BIT DEFAULT 1,
    DefaultLanguage NVARCHAR(10),
    SupportedLanguages NVARCHAR(500), -- JSON array of language codes
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME DEFAULT GETUTCDATE()
);

-- Languages (UR-030)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_Languages (
    LanguageCode NVARCHAR(10) PRIMARY KEY,
    LanguageName NVARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1
);

-- Terms & Conditions / Privacy Policy (UR-031)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_LegalDocuments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CountryCode NVARCHAR(10) NOT NULL,
    DocumentType NVARCHAR(50) NOT NULL, -- 'TermsAndConditions', 'PrivacyPolicy'
    LanguageCode NVARCHAR(10) NOT NULL,
    DocumentURL NVARCHAR(500),
    DocumentContent NVARCHAR(MAX),
    Version NVARCHAR(20),
    EffectiveDate DATETIME,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (CountryCode) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Countries(CountryCode),
    FOREIGN KEY (LanguageCode) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Languages(LanguageCode)
);

-- ============================================================================
-- PRODUCT / ITEM MASTER DATA (UR-028, UR-032, UR-033)
-- ============================================================================

-- Items (Products/Equipment) - Extended
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_Items (
    ItemNumber NVARCHAR(50) PRIMARY KEY,
    ItemDescription NVARCHAR(500),
    SerialNumber NVARCHAR(100),
    LotNumber NVARCHAR(100),
    ProductFamily NVARCHAR(100),
    ProductLine NVARCHAR(100),
    IsServiceable BIT DEFAULT 0, -- UR-028: Only serviceable items shown
    RepairabilityStatus NVARCHAR(50), -- UR-041: 'MedSurg Depot Repair', 'Field Repair', etc.
    InstallBaseStatus NVARCHAR(50), -- UR-033: Asset status
    EligibilityCountries NVARCHAR(MAX), -- JSON array of country codes
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME DEFAULT GETUTCDATE(),
    INDEX IX_SerialNumber (SerialNumber),
    INDEX IX_LotNumber (LotNumber),
    INDEX IX_IsServiceable_Country (IsServiceable) INCLUDE (RepairabilityStatus)
);

-- Repairability Status Master (UR-041)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_RepairabilityStatuses (
    StatusCode NVARCHAR(50) PRIMARY KEY,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    AllowAutomation BIT DEFAULT 1, -- For future automation
    RepairLocation NVARCHAR(50), -- 'Depot', 'Field', 'Exchange', etc.
    CreatedDate DATETIME DEFAULT GETUTCDATE()
);

-- ============================================================================
-- CUSTOMER DATA
-- ============================================================================

-- Customers - Extended
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_Customers (
    CustomerNumber NVARCHAR(50) PRIMARY KEY,
    CustomerName NVARCHAR(200) NOT NULL,
    CountryCode NVARCHAR(10),
    BillToAddress NVARCHAR(500),
    ShipToAddress NVARCHAR(500),
    PhoneNumber NVARCHAR(50),
    Email NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    HasProCareContract BIT DEFAULT 0,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (CountryCode) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Countries(CountryCode)
);

-- Customer Territories
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_CustomerTerritories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerNumber NVARCHAR(50) NOT NULL,
    Territory NVARCHAR(100) NOT NULL,
    FOREIGN KEY (CustomerNumber) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Customers(CustomerNumber),
    INDEX IX_Customer_Territory (CustomerNumber, Territory)
);

-- Customer Users (who can submit requests)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_CustomerUsers (
    Email NVARCHAR(200) PRIMARY KEY,
    CustomerNumber NVARCHAR(50) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    PhoneNumber NVARCHAR(50),
    PreferredLanguage NVARCHAR(10),
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    LastLoginDate DATETIME,
    FOREIGN KEY (CustomerNumber) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Customers(CustomerNumber)
);

-- ============================================================================
-- ISSUE / ERROR CODES (UR-040)
-- ============================================================================

-- Main Issue Reasons
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_IssueReasons (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    MainReason NVARCHAR(200) NOT NULL,
    SubReason NVARCHAR(200),
    LanguageCode NVARCHAR(10) DEFAULT 'en',
    IsActive BIT DEFAULT 1,
    DisplayOrder INT,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (LanguageCode) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Languages(LanguageCode),
    INDEX IX_MainReason_Active (MainReason, IsActive)
);

-- ============================================================================
-- SERVICE REQUESTS - MAIN TABLE (UR-034 to UR-045)
-- ============================================================================

CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests (
    -- Primary Key
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RequestCode NVARCHAR(50) UNIQUE NOT NULL, -- UR-044: Unique request ID

    -- Request Type (UR-036)
    RequestType NVARCHAR(50) NOT NULL, -- 'Serial', 'Item', 'General'

    -- Customer Information (UR-037: Mandatory fields)
    CustomerNumber NVARCHAR(50),
    CustomerName NVARCHAR(200),
    ContactEmail NVARCHAR(200) NOT NULL, -- Mandatory
    ContactPhone NVARCHAR(50),
    ContactName NVARCHAR(200) NOT NULL, -- Mandatory

    -- Location Information (UR-037)
    CountryCode NVARCHAR(10) NOT NULL, -- Mandatory, for routing (UR-046)
    Territory NVARCHAR(100),
    SiteAddress NVARCHAR(500),

    -- Product/Item Information (UR-034)
    SerialNumber NVARCHAR(100), -- Primary input
    ItemNumber NVARCHAR(50), -- Secondary input
    LotNumber NVARCHAR(100),
    ItemDescription NVARCHAR(500),
    ProductFamily NVARCHAR(100),

    -- Issue Details (UR-040)
    MainReason NVARCHAR(200) NOT NULL, -- Mandatory
    SubReason NVARCHAR(200),
    IssueDescription NVARCHAR(MAX), -- Detailed description

    -- Service Details
    RepairabilityStatus NVARCHAR(50), -- UR-041: Auto-assigned
    RequestedServiceDate DATETIME, -- UR-037: Optional
    UrgencyLevel NVARCHAR(20), -- 'Normal', 'Urgent', 'Critical'

    -- Additional Services (Optional)
    LoanerRequired BIT DEFAULT 0,
    LoanerDetails NVARCHAR(MAX),
    QuoteRequired BIT DEFAULT 0,

    -- Status & Workflow
    Status NVARCHAR(50) DEFAULT 'Submitted', -- 'Submitted', 'In Progress', 'Resolved', 'Closed'
    AssignedTo NVARCHAR(200), -- Email of assigned technician
    Priority INT DEFAULT 2, -- 1=High, 2=Medium, 3=Low

    -- Metadata
    SubmittedByEmail NVARCHAR(200) NOT NULL,
    SubmittedByName NVARCHAR(200),
    SubmittedDate DATETIME DEFAULT GETUTCDATE(),
    LastModifiedDate DATETIME DEFAULT GETUTCDATE(),
    LastModifiedBy NVARCHAR(200),
    LanguageCode NVARCHAR(10) DEFAULT 'en', -- Language used for submission

    -- Notes & Comments
    InternalNotes NVARCHAR(MAX),
    CustomerNotes NVARCHAR(MAX),

    -- Integration tracking
    OracleRepairOrderId NVARCHAR(100), -- For future Oracle integration
    SalesforceWorkOrderId NVARCHAR(100), -- For future SFDC integration

    FOREIGN KEY (CustomerNumber) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Customers(CustomerNumber),
    FOREIGN KEY (CountryCode) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_Countries(CountryCode),
    FOREIGN KEY (RepairabilityStatus) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_RepairabilityStatuses(StatusCode),

    INDEX IX_Status_Date (Status, SubmittedDate DESC),
    INDEX IX_Customer (CustomerNumber),
    INDEX IX_Serial (SerialNumber),
    INDEX IX_RequestCode (RequestCode)
);

-- ============================================================================
-- ATTACHMENTS (UR-043)
-- ============================================================================

CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_Attachments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    BlobPath NVARCHAR(500) NOT NULL, -- Azure Blob Storage path
    FileSize BIGINT,
    ContentType NVARCHAR(100),
    UploadedDate DATETIME DEFAULT GETUTCDATE(),
    UploadedBy NVARCHAR(200),
    Description NVARCHAR(500),
    FOREIGN KEY (RequestId) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests(Id) ON DELETE CASCADE,
    INDEX IX_Request (RequestId)
);

-- ============================================================================
-- USER MANAGEMENT & ACCESS CONTROL (UR-052)
-- ============================================================================

-- Territory Assignments (Sales Technicians)
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_TerritoryMappings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(200) NOT NULL,
    Territory NVARCHAR(100) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    INDEX IX_Email_Territory (Email, Territory)
);

-- Admin Users
CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_AdminUsers (
    Email NVARCHAR(200) PRIMARY KEY,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Role NVARCHAR(50), -- 'Admin', 'SuperAdmin', 'BusinessAdmin'
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETUTCDATE(),
    LastLoginDate DATETIME
);

-- ============================================================================
-- ACTIVITY LOG (Audit trail)
-- ============================================================================

CREATE TABLE REGOPS_APP.tbl_globi_eu_am_99_ActivityLog (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT,
    ActivityType NVARCHAR(50) NOT NULL, -- 'Created', 'StatusChanged', 'NoteAdded', etc.
    ActivityDescription NVARCHAR(MAX),
    PerformedBy NVARCHAR(200),
    PerformedDate DATETIME DEFAULT GETUTCDATE(),
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    FOREIGN KEY (RequestId) REFERENCES REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests(Id),
    INDEX IX_Request_Date (RequestId, PerformedDate DESC)
);

-- ============================================================================
-- DASHBOARD / METRICS (UR-050)
-- ============================================================================

-- Request Metrics View
GO
CREATE VIEW REGOPS_APP.vw_RequestMetrics AS
SELECT
    CountryCode,
    Status,
    RepairabilityStatus,
    CAST(SubmittedDate AS DATE) AS SubmittedDate,
    COUNT(*) AS RequestCount,
    AVG(DATEDIFF(HOUR, SubmittedDate, GETUTCDATE())) AS AvgAgeInHours
FROM REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests
GROUP BY CountryCode, Status, RepairabilityStatus, CAST(SubmittedDate AS DATE);
GO

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Insert default languages (UR-030)
INSERT INTO REGOPS_APP.tbl_globi_eu_am_99_Languages (LanguageCode, LanguageName, IsActive) VALUES
('en', 'English', 1),
('de', 'German', 1),
('fr', 'French', 1),
('it', 'Italian', 1),
('es', 'Spanish', 1),
('nl', 'Dutch', 1),
('pt', 'Portuguese', 1),
('sv', 'Swedish', 1),
('da', 'Danish', 1),
('no', 'Norwegian', 1),
('fi', 'Finnish', 1);

-- Insert default countries
INSERT INTO REGOPS_APP.tbl_globi_eu_am_99_Countries (CountryCode, CountryName, DefaultLanguage, SupportedLanguages) VALUES
('CA', 'Canada', 'en', '["en", "fr"]'),
('US', 'United States', 'en', '["en", "es"]'),
('DE', 'Germany', 'de', '["de", "en"]'),
('FR', 'France', 'fr', '["fr", "en"]'),
('IT', 'Italy', 'it', '["it", "en"]'),
('ES', 'Spain', 'es', '["es", "en"]'),
('NL', 'Netherlands', 'nl', '["nl", "en"]'),
('PT', 'Portugal', 'pt', '["pt", "en"]'),
('SE', 'Sweden', 'sv', '["sv", "en"]'),
('DK', 'Denmark', 'da', '["da", "en"]'),
('NO', 'Norway', 'no', '["no", "en"]'),
('FI', 'Finland', 'fi', '["fi", "en"]');

-- Insert default repairability statuses (UR-041)
INSERT INTO REGOPS_APP.tbl_globi_eu_am_99_RepairabilityStatuses (StatusCode, StatusName, RepairLocation, IsActive) VALUES
('DEPOT_MEDSURG', 'MedSurg Depot Repair', 'Depot', 1),
('DEPOT_MEDICAL', 'Medical Depot Repair', 'Depot', 1),
('FIELD_REPAIR', 'Field Repair', 'Field', 1),
('EXCHANGE', 'Exchange', 'Depot', 1),
('NON_REPAIRABLE', 'Non-Repairable', NULL, 0);

-- Insert sample issue reasons (UR-040)
INSERT INTO REGOPS_APP.tbl_globi_eu_am_99_IssueReasons (MainReason, SubReason, LanguageCode, DisplayOrder) VALUES
('Equipment Malfunction', 'Power Issue', 'en', 1),
('Equipment Malfunction', 'Mechanical Failure', 'en', 2),
('Equipment Malfunction', 'Software/Firmware Issue', 'en', 3),
('Preventive Maintenance', 'Scheduled PM', 'en', 4),
('Preventive Maintenance', 'Calibration Required', 'en', 5),
('Installation Required', 'New Equipment Setup', 'en', 6),
('Installation Required', 'Relocation', 'en', 7),
('Other', 'General Inquiry', 'en', 8);

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Generate unique request code (UR-044)
GO
CREATE PROCEDURE REGOPS_APP.sp_GenerateRequestCode
    @CountryCode NVARCHAR(10),
    @RequestCode NVARCHAR(50) OUTPUT
AS
BEGIN
    DECLARE @Sequence INT;
    DECLARE @Year NVARCHAR(4) = CAST(YEAR(GETUTCDATE()) AS NVARCHAR(4));
    DECLARE @Month NVARCHAR(2) = RIGHT('0' + CAST(MONTH(GETUTCDATE()) AS NVARCHAR(2)), 2);

    SELECT @Sequence = ISNULL(MAX(CAST(RIGHT(RequestCode, 6) AS INT)), 0) + 1
    FROM REGOPS_APP.tbl_globi_eu_am_99_ServiceRequests
    WHERE RequestCode LIKE @CountryCode + '-' + @Year + @Month + '-%';

    SET @RequestCode = @CountryCode + '-' + @Year + @Month + '-' + RIGHT('000000' + CAST(@Sequence AS NVARCHAR(6)), 6);
END;
GO

PRINT 'Database schema created successfully in REGOPS_APP!';
PRINT 'All tables use naming convention: tbl_globi_eu_am_99_TableName';
