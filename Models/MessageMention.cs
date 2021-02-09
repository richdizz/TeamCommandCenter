// <copyright file="MessageMention.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for MessageMention.
    /// </summary>
    public class MessageMention
    {
        public string id { get; set; }
        public string mentionText { get; set; }
        public MessageActor mentioned { get; set; }
    }
}