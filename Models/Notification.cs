// <copyright file="Notification.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for Notification.
    /// </summary>
    public class Notification
    {
        public string id { get; set; }
        public string subscriptionId { get; set; }
        public string changeType { get; set; }
        public string clientState { get; set; }
        public DateTime subscriptionExpirationDateTime { get; set; }
        public string resource { get; set; }
        public ResourceData resourceData { get; set; }
        public EncryptionData encryptedContent { get; set; }
        public string tenantId { get; set; }
    }

    public class ResourceData
    {
        public string id { get; set; }
    }

    public class EncryptionData
    {
        public string data { get; set; }
        public string dataSignature { get; set; }
        public string dataKey { get; set; }
        public string encryptionCertificateId { get; set; }
        public string encryptionCertificateThumbprint { get; set; }
    }
}