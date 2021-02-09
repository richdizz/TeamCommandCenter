// <copyright file="Channel.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace TeamCommandCenter.Models
{
    /// <summary>
    /// Class for Channel.
    /// </summary>
    public class Channel
    {
        /// <summary>
        /// Gets or sets the ID for the channe;.
        /// </summary>
        /// <value>The channel id.</value>
        public string id { get; set; }

        /// <summary>
        /// Gets or sets the displayName for the channel.
        /// </summary>
        /// <value>The displayName.</value>
        public string displayName { get; set; }

        /// <summary>
        /// Gets or sets the description for the channel.
        /// </summary>
        /// <value>The description.</value>
        public string description { get; set; }
    }
}
