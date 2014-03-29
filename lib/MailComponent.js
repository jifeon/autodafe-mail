var autodafe = require('autodafe'),
    email = require('emailjs'),
    _ = autodafe._;

/**
 * todo: more docs for ssl
 * Options for SMTP server
 * @typedef {object} SMTPOptions
 * @property {string} user username for logging into smtp
 * @property {string} password password for logging into smtp
 * @property {string} host smtp host
 * @property {?string} port smtp port (if null a standard port number will be used)
 * @property {?boolean|object} ssl boolean or object {key, ca, cert} (if exists, ssl connection will be made)
 * @property {?boolean} tls boolean (if true, starttls will be initiated)
 * @property {?number} timeout max number of milliseconds to wait for smtp responses (defaults to 5000)
 * @property {?string} domain domain to greet smtp with (defaults to os.hostname)
 * @see https://github.com/eleith/emailjs/
 */

/**
 * Email address. Formatted as `address` or `name <address>` or `"name" <address>`. Multiple addresses are separated by
 * a comma
 * @typedef {string} Address
 */

/**
 * Attachment for an email. One of path, data or stream parameters is required.
 * @typedef {object} Attachment
 * @property {?string} path string to where the file is located
 * @property {?string} data string of the data you want to attach
 * @property {?stream.Readable} stream binary stream that will provide attachment data (make sure it is in the paused
 * state) better performance for binary streams is achieved if buffer.length % (76*6) == 0 current max size of buffer
 * must be no larger than {@link email.Message.BUFFERSIZE}
 *
 * @propertY {?string} type string of the file mime type
 * @propertY {?string} name name to give the file as perceived by the recipient
 * @propertY {?boolean} alternative if true, will be attached inline as an alternative (also defaults type='text/html')
 * @propertY {?boolean} inline if true, will be attached inline
 * @propertY {?boolean} encoded set this to true if the data is already base64 encoded, (avoid this if possible)
 * @propertY {?object} headers object containing header=>value pairs for inclusion in this attachment's header
 * @propertY {?Array.<Attachment>} related an array of attachments that you want to be related to the parent attachment
 */

/**
 * Message to send through the mail component
 * @typedef {object} Message
 * @property {?string} text text of the email
 * @property {?Address} from sender
 * @property {?Address} to recipients
 * @property {?Address} cc carbon copied recipients
 * @property {?Address} bcc blind carbon copied recipients
 * @property {?string} subject string subject of the email
 * @property {?Attachment|Array.<Attachment>} attachment one attachment or array of attachments
 */

/**
 * @class MailComponent
 * @extends Component
 * @param {object} options
 * @params {SMTPOptions} [options.smtp]
 * @params {Message} [options.defaultMessage]
 */
var MailComponent = module.exports = autodafe.Component.extend(/**@lends MailComponent*/{
    /**
     * @protected
     */
    _props: function () {
        this._super();

        /**
         * @type {email.server}
         * @private
         */
        this._server = email.server.connect(this._options.smtp);

        /**
         * @type {Message}
         * @private
         */
        this._defaultMessage = this._options.defaultMessage || {};
    },

    /**
     * @public
     * @param {string|Message} [message] will be merged with {@link MailComponent._defaultMessage}
     * @param {Callback} [callback]
     * @returns {MailComponent} this
     */
    sendMessage: function (message, callback) {
        if (typeof message == 'string') {
            message = {text: message};
        }
        message = _(message).defaults(this._defaultMessage);

        callback = callback || this._stdCallback;

        this.log('Sending a message with subject `%(subject)s` to `%(to)s`', message);
        this._server.send(message, function (e, message) {
            if (e) {
                this.log('A message  with subject `%(subject)s` to `%(to)s has not been sent', message, 'error');
                this.log(e);
            }
            else {
                this.log('A message  with subject `%(subject)s` to `%(to)s has been sent', message, 'info');
            }

            callback(e, message);
        }.bind(this));

        return this;
    }
});