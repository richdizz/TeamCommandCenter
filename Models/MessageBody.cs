// <copyright file="MessageBody.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for MessageBody.
    /// </summary>
    public class MessageBody
    {
        public string contentType { get; set; }
        public string content { get; set; }
    }
}