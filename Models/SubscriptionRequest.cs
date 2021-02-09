// <copyright file="SubscriptionRequest.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for SubscriptionRequest.
    /// </summary>
    public class SubscriptionRequest
    {
        public string changeType { get; set; }
        public string notificationUrl { get; set; }
        public string resource { get; set; }
        public DateTime expirationDateTime { get; set; }
        public string clientState { get; set; }
    }
}