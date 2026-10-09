from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def color_scheme(self):
        """Select the light or dark asset bundle for the web client.

        Odoo 18 Community has no ``color_scheme()`` hook: its
        ``web.webclient_bootstrap`` template reads the ``color_scheme`` cookie
        directly. This module adds this method and points that template at it
        (views/webclient_templates.xml), so the user's saved preference picks
        ``web.assets_web_dark`` on the very first load, like in Odoo 19+.

        * ``light`` / ``dark``: the user's explicit choice.
        * ``system``: the server cannot know the OS preference on the first
          request, so the client stores the resolved value in the
          ``color_scheme`` cookie and reloads once if needed.
        * public / portal users: Odoo's own behavior (the cookie).
        """
        cookie_scheme = "dark" if request and request.httprequest.cookies.get("color_scheme") == "dark" else "light"
        if not request or not request.session.uid:
            return cookie_scheme
        user = self.env.user
        if user._is_public() or not user._is_internal():
            return cookie_scheme
        settings = user.sudo().res_users_settings_id
        mode = settings.cbt_theme_mode if settings else "light"
        if mode == "dark":
            return "dark"
        if mode == "system":
            return cookie_scheme
        return "light"
