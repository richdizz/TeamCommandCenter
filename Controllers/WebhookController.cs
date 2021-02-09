using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using TeamCommandCenter.Models;

namespace TeamCommandCenter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhookController : ControllerBase
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IOptions<AzureADSettings> _azureADOptions;
        public WebhookController(IHubContext<NotificationHub> hubContext, IOptions<AzureADSettings> azureADOptions)
        {
            _hubContext = hubContext;
            _azureADOptions = azureADOptions;
        }

        [HttpPost]
        [Route("/api/webhook")]
        public async Task<ActionResult> Post([FromQuery] string validationToken)
        {
            // check if this is a new subscription
            if (!string.IsNullOrEmpty(validationToken))
            {
                // return the validationToken to create the subscription
                return Content(validationToken, "plain/text");
            }
            else
            {
                // Parse the recieved notification
                using (var reader = new System.IO.StreamReader(Request.Body))
                {
                    var body = await reader.ReadToEndAsync();
                    var o = JObject.Parse(body);
                    JArray a = (JArray)o["value"];
                    List<Models.Notification> notifications = a.ToObject<List<Models.Notification>>();
                    await processNotifications(notifications);
                }
                
                return Accepted();
            }
        }

        private async Task processNotifications(List<Models.Notification> Notifications)
        {
            foreach (var notification in Notifications)
            {
                // decrypt resource data into Message
                var decryptedJson = Utils.Decryptor.Decrypt(notification.encryptedContent.data, 
                    notification.encryptedContent.dataKey, 
                    notification.encryptedContent.dataSignature,
                    this._azureADOptions.Value);
                
                // convert decryptedJson to message object
                var msg = JsonConvert.DeserializeObject<Models.Message>(decryptedJson);
                await _hubContext.Clients.All.SendAsync("Notify", msg);
            }
        }
    }
}
