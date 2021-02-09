extern alias GraphBetaLib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Auth;
using Microsoft.Graph.Extensions;
using GraphBeta = GraphBetaLib::Microsoft.Graph;
using Microsoft.Identity.Client;
using TeamCommandCenter.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace TeamCommandCenter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChannelController : ControllerBase
    {
        private readonly ILogger<ChannelController> logger;
        private readonly IOptions<AzureADSettings> azureADOptions;

        public ChannelController(ILogger<ChannelController> logger, IOptions<AzureADSettings> azureADOptions)
        {
            this.logger = logger;
            this.azureADOptions = azureADOptions;
        }

        [HttpGet]
        [Route("/api/channel/{id}")]
        public async Task<List<Models.Channel>> Get(string id)
        {
            var authProvider = CreateClientCredentialProvider(this.azureADOptions.Value);
            var graphServiceClient = new Microsoft.Graph.GraphServiceClient(authProvider);
            var data = await graphServiceClient.Teams[id].Channels.Request().GetAsync();
            List<Models.Channel> items = new List<Models.Channel>();
            foreach (var item in data)
                items.Add(new Models.Channel() { id = item.Id, displayName = item.DisplayName, description = item.Description});
            return items;
        }

        [HttpGet]
        [Route("/api/channel/{teamid}/{channelid}")]
        public async Task<List<Models.Message>> GetThreads(string teamid, string channelid)
        {
            var authProvider = CreateClientCredentialProvider(this.azureADOptions.Value);
            var graphServiceClient = new Microsoft.Graph.GraphServiceClient(authProvider);
            HttpRequestMessage msg = new HttpRequestMessage(HttpMethod.Get, $"https://graph.microsoft.com/v1.0/teams/{teamid}/channels/{channelid}/messages");
            await authProvider.AuthenticateRequestAsync(msg);
            var response = await graphServiceClient.HttpProvider.SendAsync(msg);
            var json = await response.Content.ReadAsStringAsync();
            var o = JObject.Parse(json);
            JArray a = (JArray)o["value"];
            List<Models.Message> messages = a.ToObject<List<Models.Message>>();

            // get replies for each message
            for (var i = 0; i < messages.Count; i++)
            {
                var m = new HttpRequestMessage(HttpMethod.Get, $"https://graph.microsoft.com/v1.0/teams/{teamid}/channels/{channelid}/messages/{messages[i].id}/replies");
                await authProvider.AuthenticateRequestAsync(m);
                var resp = await graphServiceClient.HttpProvider.SendAsync(m);
                json = await resp.Content.ReadAsStringAsync();
                o = JObject.Parse(json);
                a = (JArray)o["value"];
                messages[i].replies = a.ToObject<List<Models.Message>>();
            }

            return messages;
        }

        private static ClientCredentialProvider CreateClientCredentialProvider(AzureADSettings aadSettings)
        {
            IConfidentialClientApplication confidentialClientApplication = ConfidentialClientApplicationBuilder
                .Create(aadSettings.AppId)
                .WithClientSecret(aadSettings.AppPassword)
                .WithTenantId(aadSettings.TenantId)
                .Build();

            return new ClientCredentialProvider(confidentialClientApplication);
        }
    }
}
