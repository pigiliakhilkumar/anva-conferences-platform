-- ANVA Conferences MySQL initial baseline
-- Generated from prisma/schema.mysql.prisma with Prisma migrate diff --from-empty.
-- Initialization only: execute once against a completely empty database.
-- No application data or credentials are included.

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMINISTRATOR', 'CONFERENCE_MANAGER', 'REVIEWER', 'PARTICIPANT') NOT NULL DEFAULT 'PARTICIPANT',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `affiliation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `orcid` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `reviewerExpertise` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conference` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `acronym` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(191) NOT NULL,
    `about` VARCHAR(191) NULL,
    `theme` VARCHAR(191) NULL,
    `scope` ENUM('INTERNATIONAL', 'NATIONAL') NOT NULL,
    `eventType` ENUM('CONFERENCE', 'CONGRESS', 'SYMPOSIUM', 'SUMMIT', 'WORKSHOP', 'SEMINAR', 'COLLOQUIUM', 'OTHER') NOT NULL,
    `customEventType` VARCHAR(191) NULL,
    `deliveryMode` ENUM('PHYSICAL', 'VIRTUAL', 'HYBRID') NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'ARCHIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    `venueName` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `venueDescription` VARCHAR(191) NULL,
    `mapUrl` VARCHAR(191) NULL,
    `virtualInfo` VARCHAR(191) NULL,
    `travelInfo` VARCHAR(191) NULL,
    `accommodationInfo` VARCHAR(191) NULL,
    `callForPapers` VARCHAR(191) NULL,
    `submissionGuidelines` VARCHAR(191) NULL,
    `abstractAllowed` BOOLEAN NOT NULL DEFAULT false,
    `fullPaperAllowed` BOOLEAN NOT NULL DEFAULT false,
    `posterAllowed` BOOLEAN NOT NULL DEFAULT false,
    `workshopProposalAllowed` BOOLEAN NOT NULL DEFAULT false,
    `submissionTypes` VARCHAR(191) NULL,
    `submissionState` ENUM('OPEN', 'CLOSED', 'UPCOMING') NOT NULL DEFAULT 'UPCOMING',
    `registrationInfo` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactRole` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `contactText` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `logoId` VARCHAR(191) NULL,
    `bannerId` VARCHAR(191) NULL,
    `socialImageId` VARCHAR(191) NULL,

    UNIQUE INDEX `Conference_slug_key`(`slug`),
    UNIQUE INDEX `Conference_logoId_key`(`logoId`),
    UNIQUE INDEX `Conference_bannerId_key`(`bannerId`),
    UNIQUE INDEX `Conference_socialImageId_key`(`socialImageId`),
    INDEX `Conference_status_startDate_idx`(`status`, `startDate`),
    INDEX `Conference_scope_status_idx`(`scope`, `status`),
    INDEX `Conference_deliveryMode_status_idx`(`deliveryMode`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceCategory` (
    `conferenceId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ConferenceCategory_categoryId_primary_idx`(`categoryId`, `primary`),
    PRIMARY KEY (`conferenceId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceSection` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `showWhenEmpty` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ConferenceSection_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    UNIQUE INDEX `ConferenceSection_conferenceId_key_key`(`conferenceId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImportantDate` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `type` ENUM('ABSTRACT_OPENS', 'ABSTRACT_DEADLINE', 'FULL_PAPER_DEADLINE', 'NOTIFICATION', 'REVISION_DEADLINE', 'EARLY_BIRD_DEADLINE', 'REGULAR_REGISTRATION_DEADLINE', 'CONFERENCE_START', 'CONFERENCE_END', 'CUSTOM') NOT NULL,
    `customLabel` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `ImportantDate_conferenceId_date_idx`(`conferenceId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceTrack` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ConferenceTrack_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Committee` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `Committee_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommitteeMember` (
    `id` VARCHAR(191) NOT NULL,
    `committeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `affiliation` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `biography` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `photoId` VARCHAR(191) NULL,

    INDEX `CommitteeMember_committeeId_sortOrder_idx`(`committeeId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Speaker` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `type` ENUM('KEYNOTE', 'INVITED', 'PLENARY', 'GUEST', 'OTHER') NOT NULL,
    `customType` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NULL,
    `affiliation` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `biography` VARCHAR(191) NULL,
    `talkTitle` VARCHAR(191) NULL,
    `profileUrl` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `photoId` VARCHAR(191) NULL,

    INDEX `Speaker_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organizer` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `type` ENUM('PRIMARY_ORGANIZER', 'CO_ORGANIZER', 'ACADEMIC_PARTNER', 'KNOWLEDGE_PARTNER', 'SUPPORTING_ORGANIZATION', 'OTHER') NOT NULL,
    `customType` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `logoId` VARCHAR(191) NULL,

    INDEX `Organizer_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationFee` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `audience` VARCHAR(191) NULL,
    `priceTier` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `RegistrationFee_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceProgrammeItem` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `day` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `room` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ConferenceProgrammeItem_conferenceId_day_sortOrder_idx`(`conferenceId`, `day`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tier` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `logoId` VARCHAR(191) NULL,

    INDEX `Sponsor_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('IMAGE', 'DOCUMENT') NOT NULL,
    `objectKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `altText` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `conferenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MediaAsset_objectKey_key`(`objectKey`),
    INDEX `MediaAsset_conferenceId_createdAt_idx`(`conferenceId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` VARCHAR(191) NOT NULL,
    `referenceNumber` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `abstractText` TEXT NOT NULL,
    `keywords` VARCHAR(191) NULL,
    `kind` ENUM('ABSTRACT', 'FULL_PAPER', 'POSTER', 'WORKSHOP_PROPOSAL', 'OTHER') NOT NULL,
    `trackId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'TECHNICAL_CHECK', 'RETURNED_FOR_CORRECTION', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'REVISED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    `technicalStatus` ENUM('PENDING', 'PASSED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `technicalNotes` TEXT NULL,
    `technicalCheckedAt` DATETIME(3) NULL,
    `technicalCheckedById` VARCHAR(191) NULL,
    `presentationClassification` ENUM('NOT_CLASSIFIED', 'ORAL', 'POSTER', 'OTHER') NOT NULL DEFAULT 'NOT_CLASSIFIED',
    `presentationNotes` TEXT NULL,
    `submittedAt` DATETIME(3) NULL,
    `withdrawnAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Submission_referenceNumber_key`(`referenceNumber`),
    INDEX `Submission_ownerId_updatedAt_idx`(`ownerId`, `updatedAt`),
    INDEX `Submission_conferenceId_status_idx`(`conferenceId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionSequence` (
    `conferenceId` VARCHAR(191) NOT NULL,
    `nextValue` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`conferenceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'SUBMITTED', 'TECHNICAL_CHECK', 'RETURNED_FOR_CORRECTION', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'REVISED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NULL,
    `toStatus` ENUM('DRAFT', 'SUBMITTED', 'TECHNICAL_CHECK', 'RETURNED_FOR_CORRECTION', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'REVISED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NOT NULL,
    `note` TEXT NULL,
    `changedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SubmissionStatusHistory_submissionId_createdAt_idx`(`submissionId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionAuthor` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `givenName` VARCHAR(191) NULL,
    `familyName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `affiliation` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `orcid` VARCHAR(191) NULL,
    `corresponding` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `SubmissionAuthor_submissionId_sortOrder_idx`(`submissionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionVersion` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `mediaId` VARCHAR(191) NULL,
    `integrityHash` VARCHAR(191) NULL,
    `revisionRound` INTEGER NOT NULL DEFAULT 0,
    `responseToReviewers` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SubmissionVersion_submissionId_versionNumber_key`(`submissionId`, `versionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `status` ENUM('INVITED', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'INVITED',
    `dueAt` DATETIME(3) NULL,
    `conflictReason` TEXT NULL,
    `invitedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `ReviewAssignment_reviewerId_status_idx`(`reviewerId`, `status`),
    UNIQUE INDEX `ReviewAssignment_submissionId_reviewerId_key`(`submissionId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `assignmentId` VARCHAR(191) NOT NULL,
    `recommendation` ENUM('ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT') NOT NULL,
    `score` INTEGER NULL,
    `authorComments` TEXT NOT NULL,
    `confidentialComments` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_assignmentId_key`(`assignmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubmissionDecision` (
    `id` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `decidedById` VARCHAR(191) NOT NULL,
    `type` ENUM('ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REVISION_REQUIRED', 'REJECT') NOT NULL,
    `comments` TEXT NOT NULL,
    `revisionRound` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SubmissionDecision_submissionId_createdAt_idx`(`submissionId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBMISSION_RECEIVED', 'TECHNICAL_CHECK_RETURNED', 'REVIEWER_INVITED', 'REVIEWER_RESPONDED', 'REVIEW_SUBMITTED', 'REVISION_REQUESTED', 'DECISION_ISSUED', 'REGISTRATION_CREATED', 'PAYMENT_PENDING', 'MANUAL_PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PAYMENT_REJECTED', 'REGISTRATION_CONFIRMED', 'REGISTRATION_CANCELLED', 'REFUND_STATUS_CHANGED', 'PROGRAMME_PUBLISHED', 'PRESENTATION_SCHEDULED', 'PROGRAMME_CHANGED', 'CERTIFICATE_ISSUED', 'CERTIFICATE_REVOKED', 'PROCEEDINGS_PUBLISHED') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_readAt_createdAt_idx`(`userId`, `readAt`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceDocument` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ConferenceDocument_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceFaq` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ConferenceFaq_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceAnnouncement` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ConferenceAnnouncement_conferenceId_publishedAt_idx`(`conferenceId`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `coverId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscriber` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `unsubscribedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscriber_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proceeding` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `publicationDate` DATETIME(3) NULL,
    `volume` VARCHAR(191) NULL,
    `publisher` VARCHAR(191) NULL,
    `isbn` VARCHAR(191) NULL,
    `issn` VARCHAR(191) NULL,
    `doi` VARCHAR(191) NULL,

    UNIQUE INDEX `Proceeding_slug_key`(`slug`),
    INDEX `Proceeding_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateType` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `CertificateType_conferenceId_name_key`(`conferenceId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NULL,
    `organizer` VARCHAR(191) NULL,
    `signatoryName` VARCHAR(191) NULL,
    `signatoryTitle` VARCHAR(191) NULL,
    `footer` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `certificateNumber` VARCHAR(191) NOT NULL,
    `verificationToken` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `typeId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,
    `status` ENUM('ISSUED', 'REVOKED') NOT NULL DEFAULT 'ISSUED',
    `recipientName` VARCHAR(191) NOT NULL,
    `conferenceTitle` VARCHAR(191) NOT NULL,
    `typeName` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,
    `revokeReason` VARCHAR(191) NULL,

    UNIQUE INDEX `Certificate_certificateNumber_key`(`certificateNumber`),
    UNIQUE INDEX `Certificate_verificationToken_key`(`verificationToken`),
    INDEX `Certificate_conferenceId_status_idx`(`conferenceId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProceedingContribution` (
    `id` VARCHAR(191) NOT NULL,
    `proceedingId` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `authorsSnapshot` VARCHAR(191) NULL,
    `abstractText` VARCHAR(191) NULL,
    `keywords` VARCHAR(191) NULL,
    `finalFileId` VARCHAR(191) NULL,
    `included` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `pageStart` INTEGER NULL,
    `pageEnd` INTEGER NULL,

    UNIQUE INDEX `ProceedingContribution_proceedingId_submissionId_key`(`proceedingId`, `submissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `metadata` VARCHAR(191) NULL,
    `ipHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditEvent_action_createdAt_idx`(`action`, `createdAt`),
    INDEX `AuditEvent_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConferenceManagerAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConferenceManagerAssignment_userId_active_idx`(`userId`, `active`),
    UNIQUE INDEX `ConferenceManagerAssignment_conferenceId_userId_key`(`conferenceId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationCategory` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `eligibilityNotes` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `requiresAcceptedSubmission` BOOLEAN NOT NULL DEFAULT false,
    `invitationOnly` BOOLEAN NOT NULL DEFAULT false,
    `manualApproval` BOOLEAN NOT NULL DEFAULT false,
    `capacity` INTEGER NULL,
    `waitlistEnabled` BOOLEAN NOT NULL DEFAULT false,
    `opensAt` DATETIME(3) NULL,
    `closesAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `RegistrationCategory_conferenceId_active_sortOrder_idx`(`conferenceId`, `active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationPrice` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `tier` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `domestic` BOOLEAN NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `RegistrationPrice_categoryId_active_startsAt_endsAt_idx`(`categoryId`, `active`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Registration` (
    `id` VARCHAR(191) NOT NULL,
    `referenceNumber` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `acceptedSubmissionId` VARCHAR(191) NULL,
    `presenter` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_PENDING_VERIFICATION', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'REFUNDED', 'COMPLIMENTARY') NOT NULL DEFAULT 'DRAFT',
    `paymentStatus` ENUM('NOT_REQUIRED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `countryAtRegistration` VARCHAR(191) NULL,
    `priceAmount` DECIMAL(65, 30) NOT NULL,
    `priceCurrency` VARCHAR(191) NOT NULL,
    `priceTier` VARCHAR(191) NOT NULL,
    `discountAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `waiverAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(65, 30) NOT NULL,
    `billingName` VARCHAR(191) NULL,
    `billingOrganization` VARCHAR(191) NULL,
    `billingAddress` VARCHAR(191) NULL,
    `billingTaxId` VARCHAR(191) NULL,
    `dietaryRequirements` VARCHAR(191) NULL,
    `accessibilityRequirements` VARCHAR(191) NULL,
    `administrativeNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedAt` DATETIME(3) NULL,
    `confirmedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Registration_referenceNumber_key`(`referenceNumber`),
    INDEX `Registration_conferenceId_status_categoryId_idx`(`conferenceId`, `status`, `categoryId`),
    INDEX `Registration_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_PENDING_VERIFICATION', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'REFUNDED', 'COMPLIMENTARY') NULL,
    `toStatus` ENUM('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_PENDING_VERIFICATION', 'CONFIRMED', 'WAITLISTED', 'CANCELLED', 'REFUNDED', 'COMPLIMENTARY') NOT NULL,
    `note` VARCHAR(191) NULL,
    `changedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RegistrationStatusHistory_registrationId_createdAt_idx`(`registrationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountCode` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `value` DECIMAL(65, 30) NOT NULL,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `maxUses` INTEGER NULL,
    `maxUsesPerParticipant` INTEGER NULL,
    `minimumFee` DECIMAL(65, 30) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DiscountCode_conferenceId_code_key`(`conferenceId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountRedemption` (
    `id` VARCHAR(191) NOT NULL,
    `discountCodeId` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `participantId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DiscountRedemption_discountCodeId_participantId_idx`(`discountCodeId`, `participantId`),
    UNIQUE INDEX `DiscountRedemption_discountCodeId_registrationId_key`(`discountCodeId`, `registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(65, 30) NOT NULL,
    `registrationIdentifier` VARCHAR(191) NULL,
    `inclusive` BOOLEAN NOT NULL DEFAULT false,
    `jurisdictionNotes` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegistrationWaiver` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `type` ENUM('FULL', 'PARTIAL', 'COMPLIMENTARY') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `authorizedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerPaymentId` VARCHAR(191) NULL,
    `internalReference` VARCHAR(191) NOT NULL,
    `status` ENUM('NOT_REQUIRED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'PENDING',
    `verificationState` VARCHAR(191) NOT NULL DEFAULT 'UNVERIFIED',
    `metadata` VARCHAR(191) NULL,
    `initiatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `failedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Payment_internalReference_key`(`internalReference`),
    INDEX `Payment_conferenceId_status_idx`(`conferenceId`, `status`),
    INDEX `Payment_provider_providerPaymentId_idx`(`provider`, `providerPaymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentEvent` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `payload` VARCHAR(191) NULL,
    `signatureVerified` BOOLEAN NOT NULL DEFAULT false,
    `processedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentEvent_paymentId_createdAt_idx`(`paymentId`, `createdAt`),
    UNIQUE INDEX `PaymentEvent_provider_eventId_key`(`provider`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManualPaymentSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `proofMediaId` VARCHAR(191) NULL,
    `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CLARIFICATION_REQUIRED') NOT NULL DEFAULT 'SUBMITTED',
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ManualPaymentSubmission_registrationId_reference_key`(`registrationId`, `reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `billingName` VARCHAR(191) NOT NULL,
    `billingAddress` VARCHAR(191) NULL,
    `organization` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `subtotal` DECIMAL(65, 30) NOT NULL,
    `discount` DECIMAL(65, 30) NOT NULL,
    `tax` DECIMAL(65, 30) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ISSUED',
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `conferenceId` VARCHAR(191) NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `Invoice_userId_issueDate_idx`(`userId`, `issueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceLineItem` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitAmount` DECIMAL(65, 30) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receipt` (
    `id` VARCHAR(191) NOT NULL,
    `receiptNumber` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `discount` DECIMAL(65, 30) NOT NULL,
    `tax` DECIMAL(65, 30) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `paymentReference` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Receipt_receiptNumber_key`(`receiptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CancellationRequest` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decidedAt` DATETIME(3) NULL,
    `decidedById` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `providerReference` VARCHAR(191) NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `approvedById` VARCHAR(191) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgrammeDay` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProgrammeDay_conferenceId_sortOrder_idx`(`conferenceId`, `sortOrder`),
    UNIQUE INDEX `ProgrammeDay_conferenceId_date_key`(`conferenceId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `building` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `floorNotes` VARCHAR(191) NULL,
    `virtualUrl` VARCHAR(191) NULL,
    `privateVirtual` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Room_conferenceId_name_key`(`conferenceId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgrammeSession` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `dayId` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NULL,
    `trackId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('KEYNOTE', 'PLENARY', 'ORAL', 'POSTER', 'WORKSHOP', 'PANEL', 'CEREMONY', 'NETWORKING', 'OTHER') NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `chairName` VARCHAR(191) NULL,
    `moderatorName` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `visibility` ENUM('DRAFT', 'PUBLISHED', 'PRIVATE') NOT NULL DEFAULT 'DRAFT',
    `capacity` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProgrammeSession_conferenceId_startsAt_endsAt_idx`(`conferenceId`, `startsAt`, `endsAt`),
    INDEX `ProgrammeSession_dayId_sortOrder_idx`(`dayId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgrammeAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `submissionId` VARCHAR(191) NULL,
    `presenterUserId` VARCHAR(191) NULL,
    `presentationTitle` VARCHAR(191) NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 0,
    `presentationStartsAt` DATETIME(3) NULL,
    `presentationEndsAt` DATETIME(3) NULL,
    `posterNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgrammeAssignment_submissionId_idx`(`submissionId`),
    UNIQUE INDEX `ProgrammeAssignment_sessionId_sequence_key`(`sessionId`, `sequence`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendee` (
    `id` VARCHAR(191) NOT NULL,
    `conferenceId` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `displayName` VARCHAR(191) NOT NULL,
    `affiliation` VARCHAR(191) NULL,
    `attendeeType` VARCHAR(191) NOT NULL,
    `presenter` BOOLEAN NOT NULL DEFAULT false,
    `qrTokenHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Attendee_registrationId_key`(`registrationId`),
    UNIQUE INDEX `Attendee_qrTokenHash_key`(`qrTokenHash`),
    INDEX `Attendee_conferenceId_status_idx`(`conferenceId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckIn` (
    `id` VARCHAR(191) NOT NULL,
    `attendeeId` VARCHAR(191) NOT NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `method` ENUM('MANUAL', 'QR') NOT NULL,
    `checkedInAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CheckIn_attendeeId_key`(`attendeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceRecord` (
    `id` VARCHAR(191) NOT NULL,
    `attendeeId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NULL,
    `recordedById` VARCHAR(191) NOT NULL,
    `method` ENUM('MANUAL', 'QR') NOT NULL,
    `attendedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttendanceRecord_attendeeId_attendedAt_idx`(`attendeeId`, `attendedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedProgrammeItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submissionId` VARCHAR(191) NULL,

    INDEX `SavedProgrammeItem_userId_createdAt_idx`(`userId`, `createdAt`),
    UNIQUE INDEX `SavedProgrammeItem_userId_sessionId_key`(`userId`, `sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conference` ADD CONSTRAINT `Conference_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conference` ADD CONSTRAINT `Conference_bannerId_fkey` FOREIGN KEY (`bannerId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conference` ADD CONSTRAINT `Conference_socialImageId_fkey` FOREIGN KEY (`socialImageId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceCategory` ADD CONSTRAINT `ConferenceCategory_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceCategory` ADD CONSTRAINT `ConferenceCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceSection` ADD CONSTRAINT `ConferenceSection_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImportantDate` ADD CONSTRAINT `ImportantDate_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceTrack` ADD CONSTRAINT `ConferenceTrack_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Committee` ADD CONSTRAINT `Committee_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommitteeMember` ADD CONSTRAINT `CommitteeMember_committeeId_fkey` FOREIGN KEY (`committeeId`) REFERENCES `Committee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommitteeMember` ADD CONSTRAINT `CommitteeMember_photoId_fkey` FOREIGN KEY (`photoId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Speaker` ADD CONSTRAINT `Speaker_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Speaker` ADD CONSTRAINT `Speaker_photoId_fkey` FOREIGN KEY (`photoId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organizer` ADD CONSTRAINT `Organizer_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organizer` ADD CONSTRAINT `Organizer_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationFee` ADD CONSTRAINT `RegistrationFee_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceProgrammeItem` ADD CONSTRAINT `ConferenceProgrammeItem_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_technicalCheckedById_fkey` FOREIGN KEY (`technicalCheckedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `ConferenceTrack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionSequence` ADD CONSTRAINT `SubmissionSequence_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionStatusHistory` ADD CONSTRAINT `SubmissionStatusHistory_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionStatusHistory` ADD CONSTRAINT `SubmissionStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionAuthor` ADD CONSTRAINT `SubmissionAuthor_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionVersion` ADD CONSTRAINT `SubmissionVersion_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionVersion` ADD CONSTRAINT `SubmissionVersion_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewAssignment` ADD CONSTRAINT `ReviewAssignment_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewAssignment` ADD CONSTRAINT `ReviewAssignment_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `ReviewAssignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionDecision` ADD CONSTRAINT `SubmissionDecision_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubmissionDecision` ADD CONSTRAINT `SubmissionDecision_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceDocument` ADD CONSTRAINT `ConferenceDocument_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceDocument` ADD CONSTRAINT `ConferenceDocument_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceFaq` ADD CONSTRAINT `ConferenceFaq_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceAnnouncement` ADD CONSTRAINT `ConferenceAnnouncement_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proceeding` ADD CONSTRAINT `Proceeding_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateType` ADD CONSTRAINT `CertificateType_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CertificateTemplate` ADD CONSTRAINT `CertificateTemplate_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `CertificateType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `CertificateTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProceedingContribution` ADD CONSTRAINT `ProceedingContribution_proceedingId_fkey` FOREIGN KEY (`proceedingId`) REFERENCES `Proceeding`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProceedingContribution` ADD CONSTRAINT `ProceedingContribution_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProceedingContribution` ADD CONSTRAINT `ProceedingContribution_finalFileId_fkey` FOREIGN KEY (`finalFileId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditEvent` ADD CONSTRAINT `AuditEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceManagerAssignment` ADD CONSTRAINT `ConferenceManagerAssignment_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConferenceManagerAssignment` ADD CONSTRAINT `ConferenceManagerAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationCategory` ADD CONSTRAINT `RegistrationCategory_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationPrice` ADD CONSTRAINT `RegistrationPrice_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `RegistrationCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `RegistrationCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_acceptedSubmissionId_fkey` FOREIGN KEY (`acceptedSubmissionId`) REFERENCES `Submission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationStatusHistory` ADD CONSTRAINT `RegistrationStatusHistory_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationStatusHistory` ADD CONSTRAINT `RegistrationStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountCode` ADD CONSTRAINT `DiscountCode_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountCode` ADD CONSTRAINT `DiscountCode_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `RegistrationCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRedemption` ADD CONSTRAINT `DiscountRedemption_discountCodeId_fkey` FOREIGN KEY (`discountCodeId`) REFERENCES `DiscountCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountRedemption` ADD CONSTRAINT `DiscountRedemption_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxConfiguration` ADD CONSTRAINT `TaxConfiguration_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationWaiver` ADD CONSTRAINT `RegistrationWaiver_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RegistrationWaiver` ADD CONSTRAINT `RegistrationWaiver_authorizedById_fkey` FOREIGN KEY (`authorizedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentEvent` ADD CONSTRAINT `PaymentEvent_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManualPaymentSubmission` ADD CONSTRAINT `ManualPaymentSubmission_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManualPaymentSubmission` ADD CONSTRAINT `ManualPaymentSubmission_proofMediaId_fkey` FOREIGN KEY (`proofMediaId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManualPaymentSubmission` ADD CONSTRAINT `ManualPaymentSubmission_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLineItem` ADD CONSTRAINT `InvoiceLineItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Receipt` ADD CONSTRAINT `Receipt_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancellationRequest` ADD CONSTRAINT `CancellationRequest_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancellationRequest` ADD CONSTRAINT `CancellationRequest_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeDay` ADD CONSTRAINT `ProgrammeDay_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeSession` ADD CONSTRAINT `ProgrammeSession_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeSession` ADD CONSTRAINT `ProgrammeSession_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `ProgrammeDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeSession` ADD CONSTRAINT `ProgrammeSession_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeSession` ADD CONSTRAINT `ProgrammeSession_trackId_fkey` FOREIGN KEY (`trackId`) REFERENCES `ConferenceTrack`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeAssignment` ADD CONSTRAINT `ProgrammeAssignment_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ProgrammeSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeAssignment` ADD CONSTRAINT `ProgrammeAssignment_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgrammeAssignment` ADD CONSTRAINT `ProgrammeAssignment_presenterUserId_fkey` FOREIGN KEY (`presenterUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendee` ADD CONSTRAINT `Attendee_conferenceId_fkey` FOREIGN KEY (`conferenceId`) REFERENCES `Conference`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendee` ADD CONSTRAINT `Attendee_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_attendeeId_fkey` FOREIGN KEY (`attendeeId`) REFERENCES `Attendee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CheckIn` ADD CONSTRAINT `CheckIn_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_attendeeId_fkey` FOREIGN KEY (`attendeeId`) REFERENCES `Attendee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ProgrammeSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedProgrammeItem` ADD CONSTRAINT `SavedProgrammeItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedProgrammeItem` ADD CONSTRAINT `SavedProgrammeItem_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ProgrammeSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedProgrammeItem` ADD CONSTRAINT `SavedProgrammeItem_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
