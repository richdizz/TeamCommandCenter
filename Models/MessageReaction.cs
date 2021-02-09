// <copyright file="MessageReaction.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for MessageReaction.
    /// </summary>
    public class MessageReaction
    {
        public string reactionType { get; set; }
        public DateTime createdDateTime { get; set; }
        public User user { get; set; }
    }
}