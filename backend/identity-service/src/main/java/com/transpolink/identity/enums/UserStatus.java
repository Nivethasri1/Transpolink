package com.transpolink.identity.enums;

public enum UserStatus {
    PENDING,    // Registered, awaiting admin approval
    ACTIVE,     // Approved by admin, can login
    REJECTED,   // Rejected by admin, cannot login
    SUSPENDED   // Suspended by admin after activation
}
