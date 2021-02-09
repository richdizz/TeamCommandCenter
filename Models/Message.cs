// <copyright file="Message.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for Message.
    /// </summary>
    public class Message
    {
        public string id { get; set; }
        public string replyToId { get; set; }
        public string etag { get; set; }
        public string messageType { get; set; }
        public DateTime createdDateTime { get; set; }
        public DateTime lastModifiedDateTime { get; set; }
        public DateTime? lastEditedDateTime { get; set; }
        public DateTime? deletedDateTime { get; set; }
        public string subject { get; set; }
        public string summary { get; set; }
        public string importance { get; set; }
        public string locale { get; set; }
        public string webUrl { get; set; }
        public MessageActor from { get; set; }
        public MessageBody body { get; set; }
        public ChannelIdentity channelIdentity { get; set; }
        public List<MessageMention> mentions { get; set; }
        public List<MessageReaction> reactions { get; set; }
        public List<Message> replies { get; set; }
    }
}