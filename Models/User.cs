// <copyright file="User.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for User.
    /// </summary>
    public class User
    {
        public string id { get; set; }
        public string displayName { get; set; }
        public string userIdentityType { get; set; }
    }
}