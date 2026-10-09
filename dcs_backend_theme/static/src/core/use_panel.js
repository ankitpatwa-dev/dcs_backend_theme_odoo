import { onMounted, onWillUnmount, useRef } from "@odoo/owl";
import { getTabableElements } from "@web/core/utils/ui";

/** Odoo 18 does not export this helper from the ui service. */
function getFirstAndLastTabableElements(el) {
    const tabable = getTabableElements(el);
    return [tabable[0], tabable[tabable.length - 1]];
}

/**
 * Accessibility plumbing shared by the theme overlays:
 * - focuses the element with [data-autofocus] (or the first tabbable)
 * - keeps Tab inside the panel while it is open (it is modal)
 * - closes on Escape
 * - restores focus to the opener when the panel goes away
 */
export function usePanel(refName, onClose) {
    const ref = useRef(refName);
    let opener = null;

    function onKeydown(ev) {
        if (ev.key === "Escape") {
            ev.preventDefault();
            ev.stopPropagation();
            onClose();
            return;
        }
        if (ev.key !== "Tab" || !ref.el) {
            return;
        }
        const [first, last] = getFirstAndLastTabableElements(ref.el);
        if (!first) {
            return;
        }
        if (ev.shiftKey && document.activeElement === first) {
            ev.preventDefault();
            last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
            ev.preventDefault();
            first.focus();
        }
    }

    onMounted(() => {
        opener = document.activeElement;
        const el = ref.el;
        if (!el) {
            return;
        }
        el.addEventListener("keydown", onKeydown);
        const target = el.querySelector("[data-autofocus]") || getFirstAndLastTabableElements(el)[0];
        target?.focus();
    });
    onWillUnmount(() => {
        ref.el?.removeEventListener("keydown", onKeydown);
        if (opener && document.contains(opener) && typeof opener.focus === "function") {
            opener.focus();
        }
    });
    return ref;
}
