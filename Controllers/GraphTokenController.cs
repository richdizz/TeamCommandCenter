// <copyright file="GraphTokenController.cs" company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace TeamCommandCenter
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Options;
    using Microsoft.Identity.Client; 

    /// <summary>
    /// /// Web API for getting the graph token.
    /// </summary>
    [Authorize]
    [ApiController]
    public class GraphTokenController : ControllerBase
    {
        private readonly IOptions<Models.AzureADSettings> azureADOptions;

        /// <summary>
        /// Initializes a new instance of the <see cref="GraphTokenController"/> class.
        /// </summary>
        /// <param name="azureADOptions">Azure AD configuration options.</param>
        public GraphTokenController(IOptions<Models.AzureADSettings> azureADOptions)
        {
            this.azureADOptions = azureADOptions;
        }

        /// <summary>
        /// Gets the Graph token from SSO token.
        /// </summary>
        /// <remarks>Gets the graph token from the sso token.</remarks>
        /// <param name="authorization">The SSO token to use.</param>
        /// <response code="200">The Graph token.</response>
        /// <returns>IActionResult.</returns>
        [HttpGet]
        [Route("/api/graphtoken")]
        public async Task<IActionResult> GetAsync([FromHeader] string authorization)
        {
            string sso_token = authorization.Substring("Bearer".Length + 1);

            IConfidentialClientApplication app = ConfidentialClientApplicationBuilder
                .Create(this.azureADOptions.Value.AppId)
                .WithClientSecret(this.azureADOptions.Value.AppPassword)
                .WithTenantId(this.azureADOptions.Value.TenantId)
                .WithAuthority($"https://login.microsoftonline.com/{this.azureADOptions.Value.TenantId}")
                .Build();

            try
            {
                var onBehalfOfToken = await app.AcquireTokenOnBehalfOf(new List<string>() { "ChannelMessage.Send", "User.ReadBasic.All" }, new UserAssertion(sso_token)).ExecuteAsync();
                return this.Ok(onBehalfOfToken.AccessToken);
            }
            catch (MsalUiRequiredException)
            {
                return this.StatusCode(403);
            }
        }
    }
}